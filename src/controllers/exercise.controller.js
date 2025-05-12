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
          attributes: ["id" ,"name", "email"], // Only include teacher's name and email
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
        attributes: ["id" ,"name", "email"],  
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

const createImageBasedExercise = async (req, res, exercise_type, questionHandler) => {
  console.log(`Creating exercise type ${exercise_type}...`);
  let transaction;

  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ code: 0, message: 'Chỉ giáo viên được tạo bài tập' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ code: 0, message: 'Vui lòng tải lên ít nhất một ảnh' });
    }

    const files = req.files;
    const data = JSON.parse(req.body.data);
    
    if (!data.questions || data.questions.length === 0) {
      return res.status(400).json({ code: 0, message: 'Danh sách câu hỏi không được trống' });
    }

    transaction = await sequelize.transaction();

    const exercise = await Exercise.create({
      exercise_type,
      grade: data.grade,
      user_id: req.user.id,
      title: data.title,
      description: data.description
    }, { transaction });

    for (let i = 0; i < data.questions.length; i++) {
      const questionData = data.questions[i];
      const image = files[i];

      const cloudinaryResult = await cloudinary.uploader.upload(image.path, {
        folder: exercise_type === 2 ? 'counting_exercises' : 'color_exercises',
        public_id: `${exercise_type}_${exercise.id}_${Date.now()}`
      });

      await questionHandler({
        exerciseId: exercise.id,
        questionData,
        imageUrl: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        transaction
      });
    }

    await transaction.commit();

    res.status(201).json({
      code: 1,
      message: `Tạo bài tập ${exercise_type === 2 ? 'đếm' : 'màu'} thành công`,
      exercise
    });

  } catch (error) {
    if (transaction) await transaction.rollback();
    if (req.files) {
      for (const file of req.files) {
        if (file.public_id) {
          await cloudinary.uploader.destroy(file.public_id);
        }
      }
    }

    console.error('Error creating exercise:', error);
    res.status(500).json({
      code: 0,
      message: 'Lỗi server',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const createCountingExercise = async (req, res) => {
  await createImageBasedExercise(req, res, 2, async ({ exerciseId, questionData, imageUrl, publicId, transaction }) => {
    const question = await CountingQuestion.create({
      exercise_id: exerciseId,
      question_text: questionData.question_text,
      image_url: imageUrl,
      public_id: publicId
    }, { transaction });

    await CountingAnswer.create({
      question_id: question.id,
      object_name: questionData.object_name,
      correct_count: questionData.correct_count
    }, { transaction });
  });
};

const createColorExercise = async (req, res) => {
  await createImageBasedExercise(req, res, 3, async ({ exerciseId, questionData, imageUrl, publicId, transaction }) => {
    const question = await ColorQuestion.create({
      exercise_id: exerciseId,
      question_text: questionData.question_text,
      image_url: imageUrl,
      public_id: publicId
    }, { transaction });

    await ColorAnswer.create({
      question_id: question.id,
      correct_position: questionData.correct_position
    }, { transaction });
  });
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

const editMultipleChoiceExercise = async (req, res) => {
  try {
    const exerciseId = req.params.id;
    const { grade, title, description, questions } = req.body;

    if (req.user.role !== 'teacher') {
      return res.status(403).json({ code: 0, message: 'Không có quyền chỉnh sửa bài tập' });
    }

    const exercise = await Exercise.findByPk(exerciseId, {
      include: [MultipleChoiceQuestion]
    });

    if (!exercise || exercise.exercise_type !== 1) {
      return res.status(404).json({ code: 0, message: 'Bài tập trắc nghiệm không tồn tại' });
    }

    await exercise.update({ grade, title, description });

    // Xóa câu hỏi và đáp án cũ
    for (const question of exercise.MultipleChoiceQuestions) {
      await MultipleChoiceAnswer.destroy({ where: { question_id: question.id } });
      await question.destroy();
    }

    // Tạo lại câu hỏi và đáp án mới
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

    res.json({ code: 1, message: 'Cập nhật bài tập trắc nghiệm thành công', exercise });
  } catch (error) {
    res.status(500).json({ code: 0, message: 'Lỗi server', error: error.message });
  }
};

const editImageBasedExercise = async (req, res, exercise_type, questionHandler) => {
  let transaction;
  try {
    const exerciseId = req.params.id;

    if (req.user.role !== 'teacher') {
      return res.status(403).json({ code: 0, message: 'Không có quyền chỉnh sửa bài tập' });
    }

    const exercise = await Exercise.findByPk(exerciseId, {
      include: exercise_type === 2 ? [CountingQuestion] : [ColorQuestion]
    });

    if (!exercise || exercise.exercise_type !== exercise_type) {
      return res.status(404).json({ code: 0, message: 'Bài tập không tồn tại' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ code: 0, message: 'Vui lòng tải lại ảnh cho mỗi câu hỏi' });
    }

    const files = req.files;
    const data = JSON.parse(req.body.data);

    if (!data.questions || data.questions.length === 0) {
      return res.status(400).json({ code: 0, message: 'Danh sách câu hỏi không được để trống' });
    }

    transaction = await sequelize.transaction();

    await exercise.update({
      grade: data.grade,
      title: data.title,
      description: data.description
    }, { transaction });

    // Xóa ảnh cũ trên cloudinary
    const oldQuestions = exercise_type === 2 ? exercise.CountingQuestions : exercise.ColorQuestions;
    for (const question of oldQuestions) {
      await cloudinary.uploader.destroy(question.public_id);
    }

    // Xóa câu hỏi và đáp án cũ
    await (exercise_type === 2 ? CountingAnswer : ColorAnswer).destroy({
      where: {
        question_id: oldQuestions.map(q => q.id)
      },
      transaction
    });
    await (exercise_type === 2 ? CountingQuestion : ColorQuestion).destroy({
      where: {
        exercise_id: exercise.id
      },
      transaction
    });

    // Tạo lại các câu hỏi và ảnh
    for (let i = 0; i < data.questions.length; i++) {
      const questionData = data.questions[i];
      const image = files[i];

      const cloudinaryResult = await cloudinary.uploader.upload(image.path, {
        folder: exercise_type === 2 ? 'counting_exercises' : 'color_exercises',
        public_id: `${exercise_type}_${exercise.id}_${Date.now()}_${i}`
      });

      await questionHandler({
        exerciseId: exercise.id,
        questionData,
        imageUrl: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        transaction
      });
    }

    await transaction.commit();

    res.json({
      code: 1,
      message: `Cập nhật bài tập ${exercise_type === 2 ? 'đếm' : 'màu'} thành công`,
      exercise
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ code: 0, message: 'Lỗi server', error: error.message });
  }
};

const editCountingExercise = async (req, res) => {
  await editImageBasedExercise(req, res, 2, async ({ exerciseId, questionData, imageUrl, publicId, transaction }) => {
    const question = await CountingQuestion.create({
      exercise_id: exerciseId,
      question_text: questionData.question_text,
      image_url: imageUrl,
      public_id: publicId
    }, { transaction });

    await CountingAnswer.create({
      question_id: question.id,
      object_name: questionData.object_name,
      correct_count: questionData.correct_count
    }, { transaction });
  });
};

const editColorExercise = async (req, res) => {
  await editImageBasedExercise(req, res, 3, async ({ exerciseId, questionData, imageUrl, publicId, transaction }) => {
    const question = await ColorQuestion.create({
      exercise_id: exerciseId,
      question_text: questionData.question_text,
      image_url: imageUrl,
      public_id: publicId
    }, { transaction });

    await ColorAnswer.create({
      question_id: question.id,
      correct_position: questionData.correct_position
    }, { transaction });
  });
};


module.exports = {
  getAllExercises,
  getExerciseDetail,
  createMultipleChoiceExercise,
  editMultipleChoiceExercise,
  createCountingExercise,
  editCountingExercise,
  createColorExercise,
  editColorExercise,
  deleteExercise,
};
