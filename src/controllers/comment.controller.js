const { Comment } = require("../models");

// Hàm lấy danh sách comment
const getComments = async (req, res) => {
  const { exerciseId } = req.params;

  try {
    const comments = await Comment.findAll({
      where: { exercise_id: exerciseId },
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách comment:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// Hàm thêm comment mới
const addComment = async (req, res) => {
  const { user_id, exercise_id, content } = req.body;

  if (!user_id || !exercise_id || !content) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin cần thiết",
    });
  }

  try {
    const newComment = await Comment.create({
      user_id,
      exercise_id,
      content,
      created_at: new Date(),
    });

    res.status(201).json({
      success: true,
      data: newComment,
    });
  } catch (error) {
    console.error("Lỗi khi thêm comment:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

module.exports = { getComments, addComment };