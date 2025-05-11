const { get } = require("../helpers/otpStrore");
const { Submission,
   Exercise , 
   MultipleChoiceQuestion, 
   ColorQuestion,
   CountingQuestion,
   StudentAnswerColor,
   StudentAnswerMultipleChoice,
   StudentAnswerCounting,
   MultipleChoiceAnswer,
   ColorAnswer,
   CountingAnswer
} = require("../models");

const getUserHistory = async (req, res) => {
  try {
    const { exercise_type } = req.query; // Lấy tham số từ query
    const userId = req.user.id; // Lấy ID người dùng từ middleware xác thực

    // Lấy danh sách lịch sử làm bài
    const history = await Submission.findAll({
      where: { student_id: userId }, // Lọc theo ID người dùng
      include: [
        {
          model: Exercise,
          where: exercise_type ? { exercise_type } : {}, // Lọc theo loại bài kiểm tra nếu có
          attributes: ["title", "exercise_type"], // Lấy các cột cần thiết từ bảng Exercise
        },
      ],
      attributes: ["id", "score", "submitted_at"], // Lấy các cột cần thiết từ bảng Submission
      order: [["submitted_at", "DESC"]], // Sắp xếp theo thời gian nộp bài giảm dần
    });

    // Định dạng dữ liệu trả về
    const data = history.map((item) => ({
      id: item.id,
      name: item.Exercise.title, // Lấy tiêu đề bài kiểm tra từ bảng Exercise
      exercise_type: item.Exercise.exercise_type, // Lấy loại bài kiểm tra
      score: item.score, // Điểm số
      submitted_at: item.submitted_at, // Thời gian nộp bài
      retry: true, // Giả sử luôn cho phép làm lại
    }));

    // Trả về kết quả
    res.json({
      code: 1,
      message: "Lấy lịch sử làm bài thành công",
      data,
    });
  } catch (error) {
    console.error("Lỗi trong getUserHistory:", error); // Log lỗi để debug
    res.status(500).json({
      code: 0,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
const getHistoryResult = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID bài kiểm tra từ params

    // Lấy thông tin bài kiểm tra từ bảng Submission
    const submission = await Submission.findOne({
      where: { id },
      attributes: ["id", "exercise_id", "score"],
      include: [
        {
          model: Exercise,
          attributes: ["title", "exercise_type"], // Lấy tên bài thi và loại bài thi
        },
      ],
    });

    if (!submission) {
      return res.status(404).json({
        code: 0,
        message: "Không tìm thấy bài kiểm tra",
      });
    }

    let totalQuestions = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;

    // Xử lý theo loại bài thi
    if (submission.Exercise.exercise_type === 1) {
      // Trắc nghiệm (Multiple Choice)
      totalQuestions = await MultipleChoiceQuestion.count({
        where: { exercise_id: submission.exercise_id },
      });

      correctAnswers = Math.round((submission.score / 100) * totalQuestions);
      wrongAnswers = totalQuestions - correctAnswers;
    }else if (submission.Exercise.exercise_type === 2) {
      // Đếm số (Counting Question)
      totalQuestions = await CountingQuestion.count({
        where: { exercise_id: submission.exercise_id },
      });

      correctAnswers = Math.round((submission.score / 100) * totalQuestions);
      wrongAnswers = totalQuestions - correctAnswers;
    } else if (submission.Exercise.exercise_type === 3) {
      // Tô màu (Color Question)
      totalQuestions = await ColorQuestion.count({
        where: { exercise_id: submission.exercise_id },
      });

      correctAnswers = Math.round((submission.score / 100) * totalQuestions);
      wrongAnswers = totalQuestions - correctAnswers;
    }  else {
      return res.status(400).json({
        code: 0,
        message: "Loại bài thi không được hỗ trợ",
      });
    }

    // Trả về kết quả
    res.json({
      code: 1,
      message: "Lấy thông tin chi tiết bài kiểm tra thành công",
      data: {
        id: submission.id,
        exerciseId: submission.exercise_id,
        examName: submission.Exercise.title,
        score: submission.score,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
      },
    });
  } catch (error) {
    console.error("Lỗi trong getHistoryResult:", error); // Log lỗi để debug
    res.status(500).json({
      code: 0,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
const getHistoryDetailMultipleChoice = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID bài kiểm tra từ params

    // Lấy thông tin bài kiểm tra từ bảng Submission
    const submission = await Submission.findOne({
      where: { id },
      include: [
        {
          model: Exercise,
          attributes: ["title", "exercise_type"], // Lấy tên bài thi và loại bài thi
        },
      ],
    });

    if (!submission) {
      return res.status(404).json({
        code: 0,
        message: "Không tìm thấy bài kiểm tra",
      });
    }

    // Kiểm tra loại bài thi có phải Multiple Choice không
    if (submission.Exercise.exercise_type !== 1) {
      return res.status(400).json({
        code: 0,
        message: "Loại bài thi không phải Multiple Choice",
      });
    }

    // Lấy danh sách câu trả lời của người dùng từ StudentAnswerMultipleChoice
    const studentAnswers = await StudentAnswerMultipleChoice.findAll({
      where: { submission_id: submission.id },
      include: [
        {
          model: MultipleChoiceQuestion, // Lấy thông tin câu hỏi từ MultipleChoiceQuestion
          attributes: ["question"], // Lấy nội dung câu hỏi
          include: [
            {
              model: MultipleChoiceAnswer, // Lấy đáp án đúng từ MultipleChoiceAnswer
              where: { is_correct: true }, // Chỉ lấy đáp án đúng
              attributes: ["answer_text"], // Lấy nội dung đáp án đúng
            },
          ],
        },
      ],
      attributes: ["selected_answer"], // Lấy thông tin câu trả lời của người dùng
    });

    // Lấy danh sách các `selected_answer` từ studentAnswers
    const selectedAnswerIds = studentAnswers.map((answer) => answer.selected_answer);

    // Truy vấn bảng MultipleChoiceAnswer để lấy thông tin userAnswer
    const multipleChoiceAnswers = await MultipleChoiceAnswer.findAll({
      where: { id: selectedAnswerIds },
      attributes: ["id", "answer_text"], // Lấy id và nội dung câu trả lời
    });

    // Tạo một ánh xạ từ id -> answer_text
    const answerMap = multipleChoiceAnswers.reduce((map, answer) => {
      map[answer.id] = answer.answer_text;
      return map;
    }, {});

    // Định dạng dữ liệu trả về
    const formattedAnswers = studentAnswers.map((answer, index) => {
      const question = answer.MultipleChoiceQuestion;
      const correctAnswer = question.MultipleChoiceAnswers?.[0]?.answer_text || null; // Lấy đáp án đúng
      const userAnswer = answerMap[answer.selected_answer] || "Không tìm thấy câu trả lời"; // Lấy nội dung câu trả lời của người dùng

      return {
        order: index + 1,
        questionText: question?.question || "Không tìm thấy câu hỏi", // Nội dung câu hỏi
        correctAnswer: correctAnswer, // Nội dung đáp án đúng
        userAnswer: userAnswer, // Nội dung câu trả lời của người dùng
      };
    });

    // Trả về kết quả
    res.json({
      code: 1,
      message: "Lấy thông tin đáp án thành công",
      data: formattedAnswers,
    });
  } catch (error) {
    console.error("Lỗi trong getHistoryDetailMultipleChoice:", error); // Log lỗi để debug
    res.status(500).json({
      code: 0,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
const getHistoryDetailCountingQuestion = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID bài kiểm tra từ params

    // Lấy thông tin bài kiểm tra từ bảng Submission
    const submission = await Submission.findOne({
      where: { id },
      include: [
        {
          model: Exercise,
          attributes: ["title", "exercise_type"], // Lấy tên bài thi và loại bài thi
        },
      ],
    });

    if (!submission) {
      return res.status(404).json({
        code: 0,
        message: "Không tìm thấy bài kiểm tra",
      });
    }

    // Kiểm tra loại bài thi có phải Counting Question không
    if (submission.Exercise.exercise_type !== 2) {
      return res.status(400).json({
        code: 0,
        message: "Loại bài thi không phải Counting Question",
      });
    }

    // Lấy danh sách câu trả lời của học sinh từ StudentAnswerCounting
    const studentAnswers = await StudentAnswerCounting.findAll({
      where: { submission_id: submission.id },
      include: [
        {
          model: CountingQuestion, // Lấy thông tin câu hỏi từ CountingQuestion
          attributes: ["id","question_text"], // Lấy ID câu hỏi
          include: [
            {
              model: CountingAnswer, // Lấy đáp án đúng từ CountingAnswer
              attributes: [ "correct_count"], // Lấy thông tin đáp án đúng
            },
          ],
        },
      ],
      attributes: ["question_id", "selected_answer"], // Lấy thông tin câu trả lời của học sinh
      order: [["question_id", "ASC"]], // Sắp xếp thứ tự câu hỏi tăng dần
    });

    // Định dạng dữ liệu trả về
    const formattedAnswers = studentAnswers.map((answer, index) => {
      const question = answer.CountingQuestion;
      const correctAnswer = question?.CountingAnswers?.[0] || null; // Lấy đáp án đúng

      return {
        order: index + 1, // Thứ tự tự động tăng từ 1
        correctAnswer: correctAnswer?.correct_count || "Không tìm thấy đáp án đúng", // Đáp án đúng
        userAnswer: answer.selected_answer, // Câu trả lời của học sinh
        questionText: question.question_text, // Nội dung câu hỏi
      };
    });

    // Trả về kết quả
    res.json({
      code: 1,
      message: "Lấy thông tin chi tiết bài kiểm tra thành công",
      data: formattedAnswers,
    });
  } catch (error) {
    console.error("Lỗi trong getHistoryDetailCountingQuestion:", error); // Log lỗi để debug
    res.status(500).json({
      code: 0,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
const getHistoryDetailColorQuestion = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID bài kiểm tra từ params

    // Lấy thông tin bài kiểm tra từ bảng Submission
    const submission = await Submission.findOne({
      where: { id },
      include: [
        {
          model: Exercise,
          attributes: ["title", "exercise_type"], // Lấy tên bài thi và loại bài thi
        },
      ],
    });

    if (!submission) {
      return res.status(404).json({
        code: 0,
        message: "Không tìm thấy bài kiểm tra",
      });
    }

    // Kiểm tra loại bài thi có phải Color Question không
    if (submission.Exercise.exercise_type !== 3) {
      return res.status(400).json({
        code: 0,
        message: "Loại bài thi không phải Color Question",
      });
    }

    // Lấy danh sách câu trả lời của học sinh từ StudentAnswerColor
    const studentAnswers = await StudentAnswerColor.findAll({
      where: { submission_id: submission.id },
      include: [
        {
          model: ColorQuestion, // Lấy thông tin câu hỏi từ ColorQuestion
          attributes: ["id","question_text"], // Lấy ID câu hỏi
          include: [
            {
              model: ColorAnswer, // Lấy đáp án đúng từ ColorAnswer
              attributes: ["correct_position"], // Lấy thông tin đáp án đúng
            },
          ],
        },
      ],
      attributes: ["question_id", "selected_answer"], // Lấy thông tin câu trả lời của học sinh
      order: [["question_id", "ASC"]], // Sắp xếp thứ tự câu hỏi tăng dần
    });

    // Định dạng dữ liệu trả về
    const formattedAnswers = studentAnswers.map((answer, index) => {
      const question = answer.ColorQuestion;
      const correctAnswer = question?.ColorAnswers?.[0] || null; // Lấy đáp án đúng

      return {
        order: index + 1, // Thứ tự tự động tăng từ 1
        correctAnswer: correctAnswer?.correct_position || "Không tìm thấy đáp án đúng", // Đáp án đúng
        userAnswer: answer.selected_answer, // Câu trả lời của học sinh
        questionText: question.question_text,
      };
    });

    // Trả về kết quả
    res.json({
      code: 1,
      message: "Lấy thông tin chi tiết bài kiểm tra thành công",
      data: formattedAnswers,
    });
  } catch (error) {
    console.error("Lỗi trong getHistoryDetailColorQuestion:", error); // Log lỗi để debug
    res.status(500).json({
      code: 0,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
module.exports = {
  getUserHistory,
  getHistoryResult,
  getHistoryDetailMultipleChoice,
  getHistoryDetailCountingQuestion,
  getHistoryDetailColorQuestion
};