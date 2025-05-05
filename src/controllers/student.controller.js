const {
  User,
  Student,
  Exercise,
  MultipleChoiceQuestion,
  MultipleChoiceAnswer,
  Submission,
  StudentAnswerMultipleChoice,
} = require("../models");
const { sequelize } = require("../configs/connectDB");

const getStudentRankings = async (req, res) => {
  try {
    const userGrade = req.user.grade; // Grade from authenticated student's token

    const students = await User.findAll({
      where: {
        role: "student",
      },
      include: [
        {
          model: Student,
          where: {
            grade: userGrade, // Filter by same grade
          },
          required: true,
        },
      ],
      attributes: ["id", "name", "email"],
      order: [
        [Student, "score", "DESC"], // Sort by score descending
        ["name", "ASC"], // If scores are equal, sort by name ascending
      ],
    });

    // Map the results to include ranking
    const rankings = students.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      name: user.name,
      email: user.email,
      score: user.Student.score,
    }));

    res.json({
      code: 1,
      message: "Lấy danh sách xếp hạng thành công",
      rankings,
    });
  } catch (error) {
    res.status(500).json({
      code: 0,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
const submitMultipleChoiceExercise = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { exerciseId, answers } = req.body;
    const studentId = req.user.id;
    const studentGrade = req.user.grade; 

    // Verify exercise exists and is multiple choice type
    const exercise = await Exercise.findOne({
      where: {
        id: exerciseId,
        exercise_type: 1,
      },
      include: [
        {
          model: MultipleChoiceQuestion,
          include: [
            {
              model: MultipleChoiceAnswer,
              where: { is_correct: true },
            },
          ],
        },
      ],
    });

    if (!exercise) {
      return res.status(404).json({
        code: 0,
        message: "Không tìm thấy bài kiểm tra",
      });
    }

    // Get previous submissions for this exercise
    const previousSubmissions = await Submission.findAll({
      where: {
        student_id: studentId,
        exercise_id: exerciseId,
      },
      include: [
        {
          model: StudentAnswerMultipleChoice,
          include: [
            {
              model: MultipleChoiceQuestion,
              include: [
                {
                  model: MultipleChoiceAnswer,
                  where: { is_correct: true },
                },
              ],
            },
          ],
        },
      ],
    });

    // Track previously correct answers
    const previouslyCorrectQuestionIds = new Set();
    previousSubmissions.forEach((submission) => {
      submission.StudentAnswerMultipleChoices.forEach((answer) => {
        if (
          parseInt(answer.selected_answer) === // Convert string to int
          answer.MultipleChoiceQuestion.MultipleChoiceAnswers[0].id
        ) {
          previouslyCorrectQuestionIds.add(answer.question_id);
        }
      });
    });

    // Calculate score
    let correctAnswers = 0;
    let newCorrectAnswers = 0;
    const totalQuestions = exercise.MultipleChoiceQuestions.length;

    if (totalQuestions === 0) {
      return res.status(400).json({
        code: 0,
        message: "Bài kiểm tra không có câu hỏi",
      });
    }

    // Create submission record
    const submission = await Submission.create(
      {
        student_id: studentId,
        exercise_id: exerciseId,
        submitted_at: new Date(),
      },
      { transaction }
    );

    // Process each answer
    for (const answer of answers) {
      const question = exercise.MultipleChoiceQuestions.find(
        (q) => q.id === answer.questionId
      );

      if (question) {
        // Save student's answer as integer
        await StudentAnswerMultipleChoice.create(
          {
            submission_id: submission.id,
            question_id: answer.questionId,
            selected_answer: parseInt(answer.selectedAnswer), // Convert to integer
          },
          { transaction }
        );

        // Check if answer is correct using integer comparison
        const correctAnswer = question.MultipleChoiceAnswers[0];
        const isCorrect = correctAnswer && 
                         parseInt(answer.selectedAnswer) === correctAnswer.id;

        if (isCorrect) {
          correctAnswers++;
          if (!previouslyCorrectQuestionIds.has(answer.questionId)) {
            newCorrectAnswers++;
            previouslyCorrectQuestionIds.add(answer.questionId);
          }
        }
      }
    }

    // Calculate submission score (scale to 100)
    const submissionScore = Math.round((correctAnswers / totalQuestions) * 100);

    // Calculate points to add to total score
    let pointsToAdd = 0;
    if(studentGrade === exercise.grade) {
      pointsToAdd = Math.round((newCorrectAnswers / totalQuestions) * 100); 
    }

    // Update submission score
    await submission.update({ score: submissionScore }, { transaction });

    // Update student's total score only for new correct answers
    const student = await Student.findOne({
      where: { user_id: studentId },
    });

    await student.update(
      {
        score: student.score + pointsToAdd,
      },
      { transaction }
    );

    await transaction.commit();

    res.json({
      code: 1,
      message: "Nộp bài thành công",
      result: {
        totalQuestions,
        correctAnswers,
        newCorrectAnswers,
        submissionScore,
        pointsAdded: pointsToAdd,
        newStudentScore: student.score,
      },
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      code: 0,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

module.exports = {
  getStudentRankings,
  submitMultipleChoiceExercise,
};
