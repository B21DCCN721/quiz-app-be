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
    const studentGrade = req.user.grade; 

    // Lấy ra bài thi gồm câu hỏi và đáp án đúng
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

    // lấy ra các lần nộp bài trước đó
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

    // lấy ra các câu hỏi đã đúng trước đó của học sinh
    const previouslyCorrectQuestionIds = new Set();
    previousSubmissions.forEach((submission) => {
      submission.StudentAnswerMultipleChoices.forEach((answer) => {
        if (
          parseInt(answer.selected_answer) ===
          answer.MultipleChoiceQuestion.MultipleChoiceAnswers[0].id
        ) {
          previouslyCorrectQuestionIds.add(answer.question_id);
        }
      });
    });

    // tính điểmđiểm
    let correctAnswers = 0;
    let newCorrectAnswers = 0;
    const totalQuestions = exercise.MultipleChoiceQuestions.length;

    if (totalQuestions === 0) {
      return res.status(400).json({
        code: 0,
        message: "Bài kiểm tra không có câu hỏi",
      });
    }

    // tạo submission record
    const submission = await Submission.create(
      {
        student_id: studentId,
        exercise_id: exerciseId,
        submitted_at: new Date(),
      },
      { transaction }
    );

    // duyệt các câu trả lời
    for (const answer of answers) {
      const question = exercise.MultipleChoiceQuestions.find(
        (q) => q.id === answer.questionId
      );

      if (question) {
        // lưu câu trả lời
        await StudentAnswerMultipleChoice.create(
          {
            submission_id: submission.id,
            question_id: answer.questionId,
            selected_answer: parseInt(answer.selectedAnswer),
          },
          { transaction }
        );

        // Check câu trả lời đúng
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

    // tính điểm bài nộp
    const submissionScore = Math.round((correctAnswers / totalQuestions) * 100);

    // tính điểm cộng thêmthêm
    let pointsToAdd = 0;
    if(studentGrade === exercise.grade) {
      pointsToAdd = Math.round((newCorrectAnswers / totalQuestions) * 100); 
    }

    // cập nhập điểm bài nộp
    await submission.update({ score: submissionScore }, { transaction });

    // cập nhật điểm học sinh
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
  console.log('1. Bắt đầu transaction');

  try {
    const { exerciseId, answers } = req.body;
    console.log('answer: ', answers);
    const studentId = req.user.id;
    console.log('2. Input data:', { exerciseId, studentId, answers });

    // Kiểm tra bài tập
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
    console.log('3. Thông tin bài tập:', {
      exerciseExists: !!exercise,
      questionCount: exercise?.ColorQuestions?.length || 0
    });

    if (!exercise) {
      throw new Error("Không tìm thấy bài kiểm tra nhận biết màu sắc");
    }

    // Kiểm tra submissions cũ
    const previousSubmissions = await Submission.findAll({
      where: {
        student_id: studentId,
        exercise_id: exerciseId
      },
      include: [{
        model: StudentAnswerColor
      }]
    });
    console.log('4. Số lượng submissions cũ:', previousSubmissions.length);

    // Tracking câu đúng trước đó
    const previouslyCorrectQuestionIds = new Set();
    previousSubmissions.forEach(submission => {
      submission.StudentAnswerColors.forEach(answer => {
        const question = exercise.ColorQuestions.find(q => q.id === answer.question_id);
        const correctAnswer = question?.ColorAnswers?.[0];
        if (correctAnswer && parseInt(answer.selected_answer) === correctAnswer.correct_position) {
          previouslyCorrectQuestionIds.add(answer.question_id);
        }
      });
    });
    console.log('5. Số câu đúng trước đó:', previouslyCorrectQuestionIds.size);

    // Tạo submission mới
    const submission = await Submission.create({
      student_id: studentId,
      exercise_id: exerciseId,
      submitted_at: new Date()
    }, { transaction });
    console.log('6. Đã tạo submission mới:', submission.id);

    let correctAnswers = 0;
    let newCorrectAnswers = 0;
    const answerResults = [];

    // Xử lý từng câu trả lời
    console.log('7. Bắt đầu xử lý câu trả lời');
    for (const answer of answers) {
      const question = exercise.ColorQuestions.find(q => q.id === answer.questionId);
      const correctAnswer = question?.ColorAnswers?.[0];
      console.log(answer);
      console.log('7.1 Xử lý câu:', {
        questionId: answer.questionId,
        selectedAnswer: answer.answer,
        correctPosition: correctAnswer?.correct_position
      });

      // Lưu câu trả lời
      const studentAnswer = await StudentAnswerColor.create({
        submission_id: submission.id,
        question_id: answer.questionId,
        selected_answer: answer.answer.toString(),
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
    }
    console.log('8. Kết quả chấm:', {
      correctAnswers,
      newCorrectAnswers,
      totalAnswers: answers.length
    });

    // Tính điểm
    const totalQuestions = exercise.ColorQuestions.length;
    const submissionScore = Math.round((correctAnswers / totalQuestions) * 100);
    const pointsToAdd = Math.round((newCorrectAnswers / totalQuestions) * 100);
    console.log('9. Điểm số:', { submissionScore, pointsToAdd });

    // Cập nhật điểm submission
    await submission.update({ score: submissionScore }, { transaction });
    console.log('10. Đã cập nhật điểm submission');

    // Cập nhật điểm student
    const student = await Student.findOne({ where: { user_id: studentId } });
    const oldScore = student.score;
    await student.update({
      score: student.score + pointsToAdd
    }, { transaction });
    console.log('11. Đã cập nhật điểm student:', {
      oldScore,
      newScore: student.score
    });

    await transaction.commit();
    console.log('12. Transaction đã commit thành công');

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
    console.error('ERROR:', error);
    await transaction.rollback();
    console.log('Transaction đã rollback do lỗi');
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
        selected_answer: answer.answer.toString(),
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
