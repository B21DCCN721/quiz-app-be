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
const { cloudinary, upload } = require("../configs/cloudinary.config");
const { sequelize } = require("../configs/connectDB")

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
      code: 1,
      message: "Lấy danh sách bài kiểm tra thành công",
      exercises,
    });
  } catch (error) {
    res.status(500).json({
      code: 0,
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
        attributes: ["name", "email"],
      },
    ];

    // Add specific question type based on type parameter
    if (type == 1) {
      includeArray.push({
        model: MultipleChoiceQuestion,
        include: [
          {
            model: MultipleChoiceAnswer,
            attributes: ["id", "answer_text", "is_correct"],
          },
        ],
        required: true,
      });
    } else if (type == 2) {
      includeArray.push({
        model: CountingQuestion,
        include: [
          {
            model: CountingAnswer,
            attributes: ["id", "object_name", "correct_count"],
          },
        ],
        required: true,
      });
    } else if (type == 3) {
      includeArray.push({
        model: ColorQuestion,
        include: [
          {
            model: ColorAnswer,
            attributes: ["id", "correct_position"],
          },
        ],
        required: true,
      });
    }

    const exercise = await Exercise.findOne({
      where: whereClause,
      include: includeArray,
      attributes: [
        "id",
        "exercise_type",
        "grade",
        "title",
        "description",
        "created_at",
        "updated_at",
      ],
    });

    if (!exercise) {
      return res.status(404).json({
        code: 0,
        message: "Không tìm thấy bài kiểm tra",
      });
    }

    res.json({
      code: 1,
      message: "Lấy chi tiết bài kiểm tra thành công",
      exercise,
    });
  } catch (error) {
    res.status(500).json({
      code: 0,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const createMultipleChoiceExercise = async (req, res) => {
  try {
    const { grade, title, description, questions } = req.body;

    if (req.user.role !== 'teacher') {
      return res.status(403).json({ 
        code: 0,
        message: 'Không có quyền tạo bài tập' 
      });
    }

    // Tạo bài tập chung
    const exercise = await Exercise.create({
      exercise_type: 1, // Loại trắc nghiệm
      grade,
      user_id: req.user.id,
      title,
      description
    });

    // Tạo các câu hỏi và đáp án
    for (const questionData of questions) {
      const question = await MultipleChoiceQuestion.create({
        exercise_id: exercise.id,
        question: questionData.question
      });

      for (const answerData of questionData.answers) {
        await MultipleChoiceAnswer.create({
          question_id: question.id,
          answer_text: answerData.text,
          is_correct: answerData.is_correct
        });
      }
    }

    res.status(201).json({
      code: 1,
      message: 'Tạo bài tập trắc nghiệm thành công',
      exercise
    });
  } catch (error) {
    res.status(500).json({
      code: 0,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

const createCountingExercise = async (req, res) => {
  console.log('Creating couting exercise...');
  console.log('User role:', req.user.role);
  console.log('Request body:', req.body);
  let transaction;
  try {
    // 1. Kiểm tra quyền teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ 
        code: 0,
        message: 'Chỉ giáo viên được tạo bài tập' 
      });
    }

    // 2. Validate input
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        code: 0, 
        message: 'Vui lòng tải lên ít nhất một ảnh' 
      });
    }

    const files = req.files; // Mảng chứa các file đã upload
    console.log('Files uploaded:', files.map(f => f.originalname));

    const data = JSON.parse(req.body.data); // Parse JSON từ field 'data'
    console.log('Exercise data:', data);
    
    if (!data.questions || data.questions.length === 0) {
      return res.status(400).json({ 
        code: 0, 
        message: 'Danh sách câu hỏi không được trống' 
      });
    }

    // 3. Bắt đầu transaction
    transaction = await sequelize.transaction();

    // 4. Tạo bài tập chung
    const exercise = await Exercise.create({
      exercise_type: 2, // Loại Counting
      grade: data.grade,
      user_id: req.user.id,
      title: data.title,
      description: data.description
    }, { transaction });

    // 5. Xử lý từng câu hỏi và ảnh tương ứng
    for (let i = 0; i < data.questions.length; i++) {
      const questionData = data.questions[i];
      const image = req.files[i];

      // Upload ảnh lên Cloudinary
      const cloudinaryResult = await cloudinary.uploader.upload(image.path, {
        folder: 'counting_exercises',
        public_id: `counting_${exercise.id}_${Date.now()}`
      });

      // Tạo câu hỏi đếm
      const question = await CountingQuestion.create({
        exercise_id: exercise.id,
        image_url: cloudinaryResult.secure_url,
        public_id: cloudinaryResult.public_id
      }, { transaction });

      // Tạo các đáp án đếm
      for (const object of questionData.objects) {
        await CountingAnswer.create({
          question_id: question.id,
          object_name: object.object_name,
          correct_count: object.correct_count
        }, { transaction });
      }
    }

    // 6. Commit transaction nếu thành công
    await transaction.commit();

    res.status(201).json({
      code: 1,
      message: 'Tạo bài tập đếm thành công',
      exercise
    });

  } catch (error) {
    // 7. Rollback nếu có lỗi
    if (transaction) await transaction.rollback();

    // 8. Xóa ảnh đã upload trên Cloudinary (nếu có)
    if (req.files) {
      for (const file of req.files) {
        if (file.public_id) {
          await cloudinary.uploader.destroy(file.public_id);
        }
      }
    }

    // 9. Trả về lỗi chi tiết
    console.error('Error creating counting exercise:', error);
    res.status(500).json({
      code: 0,
      message: 'Lỗi server',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const createColorExercise = async (req, res) => {
  console.log('Creating color exercise...');
  console.log('User role:', req.user.role);
  console.log('Request body:', req.body);
  let transaction;

  try {
    // 1. Kiểm tra quyền teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ 
        code: 0,
        message: 'Chỉ giáo viên được tạo bài tập' 
      });
    }

    // 2. Validate input
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        code: 0, 
        message: 'Vui lòng tải lên ít nhất một ảnh' 
      });
    }
    const files = req.files; // Mảng chứa các file đã upload
    console.log('Files uploaded:', files.map(f => f.originalname));

    const data = JSON.parse(req.body.data); // Parse JSON từ field 'data'
    console.log('Exercise data:', data);

    if (!data.questions || data.questions.length === 0) {
      return res.status(400).json({ 
        code: 0, 
        message: 'Danh sách câu hỏi không được trống' 
      });
    }

    // 3. Bắt đầu transaction
    transaction = await sequelize.transaction();

    // 4. Tạo bài tập chung
    const exercise = await Exercise.create({
      exercise_type: 3, // Loại Color
      grade: data.grade,
      user_id: req.user.id,
      title: data.title,
      description: data.description
    }, { transaction });

    // 5. Xử lý từng câu hỏi và ảnh tương ứng
    for (let i = 0; i < data.questions.length; i++) {
      const questionData = data.questions[i];
      const image = req.files[i];

      // Upload ảnh lên Cloudinary
      const cloudinaryResult = await cloudinary.uploader.upload(image.path, {
        folder: 'color_exercises',
        public_id: `color_${exercise.id}_${Date.now()}`
      });

      // Tạo câu hỏi màu
      const question = await ColorQuestion.create({
        exercise_id: exercise.id,
        image_url: cloudinaryResult.secure_url,
        public_id: cloudinaryResult.public_id
      }, { transaction });

      // Tạo đáp án màu
      await ColorAnswer.create({
        question_id: question.id,
        correct_position: questionData.correct_position
      }, { transaction });
    }

    // 6. Commit transaction
    await transaction.commit();

    res.status(201).json({
      code: 1,
      message: 'Tạo bài tập màu thành công',
      exercise
    });

  } catch (error) {
    // 7. Rollback nếu có lỗi
    if (transaction) await transaction.rollback();

    // 8. Xóa ảnh đã upload
    if (req.files) {
      for (const file of req.files) {
        if (file.public_id) {
          await cloudinary.uploader.destroy(file.public_id);
        }
      }
    }

    // 9. Trả về lỗi
    console.error('Error creating color exercise:', error);
    res.status(500).json({
      code: 0,
      message: 'Lỗi server',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByPk(req.params.id, {
      include: [
        { model: CountingQuestion },
        { model: ColorQuestion }
      ]
    });

    if (!exercise) {
      return res.status(404).json({ code: 0, message: 'Bài tập không tồn tại' });
    }

    // Xóa ảnh counting questions
    if (exercise.CountingQuestions) {
      for (const question of exercise.CountingQuestions) {
        await cloudinary.uploader.destroy(question.public_id);
      }
    }

    // Xóa ảnh color questions
    if (exercise.ColorQuestions) {
      for (const question of exercise.ColorQuestions) {
        await cloudinary.uploader.destroy(question.public_id);
      }
    }

    // Xóa bài tập
    await exercise.destroy();

    res.json({ code: 1, message: 'Xóa bài tập thành công' });
  } catch (error) {
    res.status(500).json({
      code: 0,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

module.exports = {
  getAllExercises,
  getExerciseDetail,
  createMultipleChoiceExercise,
  createCountingExercise,
  createColorExercise,
  deleteExercise,
};
