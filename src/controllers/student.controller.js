const {
  User,
  Student,
  Exercise,
  MultipleChoiceQuestion,
  MultipleChoiceAnswer,
  Submission,
  StudentAnswerMultipleChoice,
  ColorAnswer,
  ColorQuestion,
  StudentAnswerColor,
  CountingQuestion,
  CountingAnswer,
  StudentAnswerCounting
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
          answer.selected_answer ===
          answer.MultipleChoiceQuestion.MultipleChoiceAnswers[0].id.toString()
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
        // Save student's answer
        await StudentAnswerMultipleChoice.create(
          {
            submission_id: submission.id,
            question_id: answer.questionId,
            selected_answer: answer.selectedAnswer, // Now storing answer ID
          },
          { transaction }
        );

        // Check if answer is correct
        const correctAnswer = question.MultipleChoiceAnswers[0];
        const isCorrect =
          correctAnswer &&
          answer.selectedAnswer === correctAnswer.id.toString();

        if (isCorrect) {
          correctAnswers++;
          // Only count for new score if not previously correct
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
    const pointsToAdd = Math.round((newCorrectAnswers / totalQuestions) * 100);

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


const submitColorExercise = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { exerciseId, answers } = req.body;
    const studentId = req.user.id;

    // Kiểm tra bài tập có tồn tại và đúng dạng bài nhận biết màu sắc (type 3)
    const exercise = await Exercise.findOne({
      where: {
        id: exerciseId,
        exercise_type: 3
      },
      include: [{
        model: ColorQuestion,
        include: [ColorAnswer]
      }]
    });

    if (!exercise) {
      return res.status(404).json({ message: "Không tìm thấy bài kiểm tra nhận biết màu sắc" });
    }

    const totalQuestions = exercise.ColorQuestions.length;
    if (totalQuestions === 0) {
      return res.status(400).json({ message: "Bài kiểm tra không có câu hỏi" });
    }

    // Lấy các bài nộp cũ của học sinh cho bài này
    const previousSubmissions = await Submission.findAll({
      where: {
        student_id: studentId,
        exercise_id: exerciseId
      },
      include: [{
        model: StudentAnswerColor
      }]
    });

    const previouslyCorrectQuestionIds = new Set();

    // Xác định những câu đã làm đúng trước đó
    previousSubmissions.forEach(submission => {
      submission.StudentAnswerColors.forEach(answer => {
        const question = exercise.ColorQuestions.find(q => q.id === answer.question_id);
        const correctAnswer = question?.ColorAnswers?.[0];

        if (correctAnswer && parseInt(answer.selected_answer) === correctAnswer.correct_position) {
          previouslyCorrectQuestionIds.add(answer.question_id);
        }
      });
    });

    // Tạo bản ghi submission mới
    const submission = await Submission.create({
      student_id: studentId,
      exercise_id: exerciseId,
      submitted_at: new Date()
    }, { transaction });

    let correctAnswers = 0;
    let newCorrectAnswers = 0;
    const answerResults = [];

    for (const answer of answers) {
      const question = exercise.ColorQuestions.find(q => q.id === answer.questionId);
      const correctAnswer = question?.ColorAnswers?.[0];

      // Lưu câu trả lời của học sinh
      const studentAnswer = await StudentAnswerColor.create({
        submission_id: submission.id,
        question_id: answer.questionId,
        selected_answer: answer.selectedAnswer.toString(),
        correct_answer: correctAnswer?.correct_position.toString()
      }, { transaction });

      const isCorrect = parseInt(studentAnswer.selected_answer) === correctAnswer?.correct_position;

      if (isCorrect) {
        correctAnswers++;
        if (!previouslyCorrectQuestionIds.has(answer.questionId)) {
          newCorrectAnswers++;
          previouslyCorrectQuestionIds.add(answer.questionId);
        }
      }

      answerResults.push({
        questionId: answer.questionId,
        selectedAnswer: parseInt(answer.selectedAnswer),
        correctAnswer: correctAnswer?.correct_position,
        isCorrect
      });

      // // So sánh câu trả lời với đáp án đúng
      // if (correctAnswer && parseInt(answer.selectedAnswer) === correctAnswer.correct_position) {
      //   correctAnswers++;
      //   if (!previouslyCorrectQuestionIds.has(answer.questionId)) {
      //     newCorrectAnswers++;
      //     previouslyCorrectQuestionIds.add(answer.questionId);
      //   }
      // }
    }

    const submissionScore = Math.round((correctAnswers / totalQuestions) * 100);
    const pointsToAdd = Math.round((newCorrectAnswers / totalQuestions) * 100);

    await submission.update({ score: submissionScore }, { transaction });

    const student = await Student.findOne({ where: { user_id: studentId } });

    await student.update({
      score: student.score + pointsToAdd
    }, { transaction });

    await transaction.commit();

    res.json({
      message: "Nộp bài thành công",
      result: {
        totalQuestions,
        correctAnswers,
        newCorrectAnswers,
        submissionScore,
        pointsAdded: pointsToAdd,
        newStudentScore: student.score,
        answers: answerResults
      }
    });

  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      message: "Lỗi server",
      error: error.message
    });
  }
};

const submitCountingExercise = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { exerciseId, answers } = req.body;
    const studentId = req.user.id;

    // Kiểm tra tồn tại bài tập và đúng loại đếm
    const exercise = await Exercise.findOne({
      where: {
        id: exerciseId,
        exercise_type: 2
      },
      include: [{
        model: CountingQuestion,
        include: [CountingAnswer]
      }]
    });

    if (!exercise) {
      return res.status(404).json({ message: "Không tìm thấy bài kiểm tra dạng đếm" });
    }

    const totalQuestions = exercise.CountingQuestions.length;
    if (totalQuestions === 0) {
      return res.status(400).json({ message: "Bài kiểm tra không có câu hỏi" });
    }

    // Lấy các lần nộp trước đó
    const previousSubmissions = await Submission.findAll({
      where: {
        student_id: studentId,
        exercise_id: exerciseId
      },
      include: [{
        model: StudentAnswerCounting
      }]
    });

    const previouslyCorrectQuestionIds = new Set();

    // Duyệt qua các lần nộp cũ để đánh dấu câu trả lời đúng trước đó
    previousSubmissions.forEach(submission => {
      submission.StudentAnswerCountings.forEach(answer => {
        const question = exercise.CountingQuestions.find(q => q.id === answer.question_id);
        const correctAnswer = question?.CountingAnswers?.[0];

        if (correctAnswer && parseInt(answer.selected_answer) === correctAnswer.correct_count) {
          previouslyCorrectQuestionIds.add(answer.question_id);
        }
      });
    });

    // Tạo submission mới
    const submission = await Submission.create({
      student_id: studentId,
      exercise_id: exerciseId,
      submitted_at: new Date()
    }, { transaction });

    // Chấm điểm
    let correctAnswers = 0;
    let newCorrectAnswers = 0;
    const answerResults = [];

    for (const answer of answers) {
      const question = exercise.CountingQuestions.find(q => q.id === answer.questionId);
      const correctAnswer = question?.CountingAnswers?.[0];

      // Lưu câu trả lời
      const studentAnswer = await StudentAnswerCounting.create({
        submission_id: submission.id,
        question_id: answer.questionId,
        selected_answer: answer.selectedAnswer.toString(),
        correct_answer: correctAnswer?.correct_count.toString()
      }, { transaction });

      const isCorrect = parseInt(studentAnswer.selected_answer) === correctAnswer?.correct_count;

      if (isCorrect) {
        correctAnswers++;
        if (!previouslyCorrectQuestionIds.has(answer.questionId)) {
          newCorrectAnswers++;
          previouslyCorrectQuestionIds.add(answer.questionId);
        }
      }

      answerResults.push({
        questionId: answer.questionId,
        selectedAnswer: parseInt(answer.selectedAnswer),
        correctAnswer: correctAnswer?.correct_count,
        isCorrect
      });

      // if (correctAnswer && parseInt(answer.selectedAnswer) === correctAnswer.correct_count) {
      //   correctAnswers++;

      //   if (!previouslyCorrectQuestionIds.has(answer.questionId)) {
      //     newCorrectAnswers++;
      //     previouslyCorrectQuestionIds.add(answer.questionId);
      //   }
      // }
    }

    const submissionScore = Math.round((correctAnswers / totalQuestions) * 100);
    const pointsToAdd = Math.round((newCorrectAnswers / totalQuestions) * 100);

    await submission.update({ score: submissionScore }, { transaction });

    const student = await Student.findOne({ where: { user_id: studentId } });

    await student.update({
      score: student.score + pointsToAdd
    }, { transaction });

    await transaction.commit();

    res.json({
      message: "Nộp bài thành công",
      result: {
        totalQuestions,
        correctAnswers,
        newCorrectAnswers,
        submissionScore,
        pointsAdded: pointsToAdd,
        newStudentScore: student.score,
        answers: answerResults
      }
    });

  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      message: "Lỗi server",
      error: error.message
    });
  }
};

module.exports = {
  getStudentRankings,
  submitMultipleChoiceExercise,
  submitColorExercise,
  submitCountingExercise
};
