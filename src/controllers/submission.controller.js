const { Submission, 
  Student,
  MultipleChoiceAnswer,
  Exercise, 
  StudentAnswerMultipleChoice, 
  StudentAnswerCounting, 
  StudentAnswerColor, 
  MultipleChoiceQuestion, 
  CountingQuestion, 
  ColorQuestion, 
  ColorAnswer,
  CountingAnswer,
  User } = require("../models");

const getSubmissionsByExercise = async (req, res) => {
  try {
    const { exercise_id } = req.params;
    
    // Kiểm tra bài tập tồn tại
    const exercise = await Exercise.findByPk(exercise_id);
    if (!exercise) {
      return res.status(404).json({ code: 0, message: "Không tìm thấy bài tập" });
    }

    let submissions;

    // Học sinh chỉ xem bài nộp của mình
    if (req.user.role === "student") {
      submissions = await Submission.findAll({
        where: { 
          exercise_id,
          student_id: req.user.id // student_id phải trùng user_id trong bảng students
        },
        include: [{
          model: Student,
          include: [{
            model: User,
            attributes: ["name", "email"]
          }]
        }],
        order: [["submitted_at", "DESC"]]
      });
    } 
    // Giáo viên xem tất cả bài nộp
    else if (req.user.role === "teacher") {
      submissions = await Submission.findAll({
        where: { exercise_id },
        include: [{
          model: Student,
          include: [{
            model: User,
            attributes: ["name", "email"]
          }]
        }],
        order: [["submitted_at", "DESC"]]
      });
    }

    // Format lại kết quả để gọn hơn
    const formattedSubmissions = submissions.map(sub => ({
      ...sub.toJSON(),
      studentName: sub.Student?.User?.name,
      studentEmail: sub.Student?.User?.email
    }));

    res.json({ 
      code: 1, 
      message: "Thành công",
      submissions: formattedSubmissions 
    });
  } catch (error) {
    res.status(500).json({ 
      code: 0, 
      message: "Lỗi server",
      error: error.message 
    });
  }
};

const getSubmissionDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy thông tin submission cơ bản
    const submission = await Submission.findOne({
      where: { id },
      include: [
        {
          model: Student,
          include: [{
            model: User,
            attributes: ['id', 'name', 'email']
          }]
        },
        {
          model: Exercise,
          attributes: ['id', 'title', 'exercise_type']
        }
      ]
    });

    if (!submission) {
      return res.status(404).json({
        code: 0,
        message: 'Không tìm thấy bài nộp'
      });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role === 'student' && submission.Student.user_id !== req.user.id) {
      return res.status(403).json({
        code: 0,
        message: 'Bạn không có quyền xem bài nộp này'
      });
    }

    // Lấy thông tin chi tiết tùy theo loại bài tập
    let questionsWithAnswers;
    const exerciseType = submission.Exercise.exercise_type;

    if (exerciseType === 1) { // Trắc nghiệm
      questionsWithAnswers = await MultipleChoiceQuestion.findAll({
        where: { exercise_id: submission.exercise_id },
        include: [
          {
            model: MultipleChoiceAnswer,
            attributes: ['id', 'answer_text', 'is_correct']
          },
          {
            model: StudentAnswerMultipleChoice,
            where: { submission_id: id },
            required: false,
            attributes: ['selected_answer']
          }
        ],
        order: [['id', 'ASC']]
      });
    } else if (exerciseType === 2) { // Đếm
      questionsWithAnswers = await CountingQuestion.findAll({
        where: { exercise_id: submission.exercise_id },
        include: [
          {
            model: CountingAnswer,
            attributes: ['id', 'object_name', 'correct_count']
          },
          {
            model: StudentAnswerCounting,
            where: { submission_id: id },
            required: false,
            attributes: ['selected_answer']
          }
        ],
        order: [['id', 'ASC']]
      });
    } else if (exerciseType === 3) { // Màu
      questionsWithAnswers = await ColorQuestion.findAll({
        where: { exercise_id: submission.exercise_id },
        include: [
          {
            model: ColorAnswer,
            attributes: ['id', 'correct_position']
          },
          {
            model: StudentAnswerColor,
            where: { submission_id: id },
            required: false,
            attributes: ['selected_answer']
          }
        ],
        order: [['id', 'ASC']]
      });
    }

    // Format lại dữ liệu trả về
    const response = {
      submission: {
        id: submission.id,
        score: submission.score,
        submitted_at: submission.submitted_at,
        student: {
          id: submission.Student.User.id,
          name: submission.Student.User.name,
          email: submission.Student.User.email
        },
        exercise: submission.Exercise
      },
      questions: questionsWithAnswers.map(q => ({
        id: q.id,
        question_text: q.question || q.image_url,
        type: exerciseType,
        correct_answers: q.MultipleChoiceAnswers || q.CountingAnswers || q.ColorAnswers,
        student_answer: q.StudentAnswerMultipleChoices?.[0]?.selected_answer || 
                       q.StudentAnswerCountings?.[0]?.selected_answer || 
                       q.StudentAnswerColors?.[0]?.selected_answer
      }))
    };

    res.json({
      code: 1,
      message: 'Lấy thông tin bài nộp thành công',
      data: response
    });

  } catch (error) {
    console.error('Error getting submission detail:', error);
    res.status(500).json({
      code: 0,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

module.exports = {
  getSubmissionsByExercise,
  getSubmissionDetail
};
