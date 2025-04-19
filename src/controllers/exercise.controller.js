const {
  Exercise,
  User,
  MultipleChoiceQuestion,
  MultipleChoiceAnswer,
  CountingQuestion,
  CountingAnswer,
  ColorQuestion,
  ColorAnswer,
} = require("../models");

const getAllExercises = async (req, res) => {
  try {
    const exercises = await Exercise.findAll({
      ...req.filters, // Apply filters from middleware
      include: [
        {
          model: User,
          attributes: ["name", "email"], // Only include teacher's name and email
        },
      ],
      attributes: [
        "id",
        "exercise_type",
        "grade",
        "title",
        "description",
        "created_at",
        "updated_at",
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({
      message: "Lấy danh sách bài kiểm tra thành công",
      exercises,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};
const getExerciseDetail = async (req, res) => {
    try {
      const { id } = req.params;
      const { type } = req.query;
  
      // Build where clause
      const whereClause = { id };
      if (type) {
        whereClause.exercise_type = type;
      }
  
      // Base include array with User model
      const includeArray = [
        {
          model: User,
          attributes: ['name', 'email']
        }
      ];
  
      // Add specific question type based on type parameter
      if (type == 1) {
        includeArray.push({
          model: MultipleChoiceQuestion,
          include: [{
            model: MultipleChoiceAnswer,
            attributes: ['id', 'answer_text', 'is_correct']
          }],
          required: true
        });
      } else if (type == 2) {
        includeArray.push({
          model: CountingQuestion,
          include: [{
            model: CountingAnswer,
            attributes: ['id', 'object_name', 'correct_count']
          }],
          required: true
        });
      } else if (type == 3) {
        includeArray.push({
          model: ColorQuestion,
          include: [{
            model: ColorAnswer,
            attributes: ['id', 'correct_position']
          }],
          required: true
        });
      }
  
      const exercise = await Exercise.findOne({
        where: whereClause,
        include: includeArray,
        attributes: ['id', 'exercise_type', 'grade', 'title', 'description', 'created_at', 'updated_at']
      });
  
      if (!exercise) {
        return res.status(404).json({
          message: "Không tìm thấy bài kiểm tra"
        });
      }
  
      res.json({
        message: "Lấy chi tiết bài kiểm tra thành công",
        exercise
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi server",
        error: error.message
      });
    }
  };

module.exports = {
  getAllExercises,
  getExerciseDetail,
};
