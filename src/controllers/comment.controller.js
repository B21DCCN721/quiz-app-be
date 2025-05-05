const { Comment, User, Notification } = require("../models");
const { sendPushNotification } = require("../services/notification.service");

// Hàm lấy danh sách comment
const getComments = async (req, res) => {
  const { exerciseId } = req.params;

  try {
    const comments = await Comment.findAll({
      where: { exercise_id: exerciseId },
      include: [
        {
          model: User,
          attributes: ["id", "name"], // Chỉ lấy các trường cần thiết từ bảng User
        },
      ],
      order: [["created_at", "DESC"]],
    });
    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách comment:", error); // Log lỗi chi tiết
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

// Thêm hàm xử lý reply comment
const replyComment = async (req, res) => {
  const { parent_id, content, exercise_id } = req.body;
  const user_id = req.user.id; // Từ middleware auth

  try {
    // Kiểm tra comment gốc tồn tại
    const parentComment = await Comment.findOne({
      where: { id: parent_id },
      include: [{ model: User, attributes: ['id', 'name'] }]
    });

    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: "Comment gốc không tồn tại"
      });
    }

    // Tạo reply comment
    const reply = await Comment.create({
      user_id,
      exercise_id,
      parent_id,
      content,
      created_at: new Date(),
    });
    
    const replier = await User.findByPk(user_id, {
      attributes: ['name'],
    });
    
    await Notification.create({
      user_id: parentComment.User.id,
      exercise_id,
      content: `${replier.name} đã trả lời bình luận của bạn`,
      notificationType: 'comment',
      created_at: new Date(),
    });
    // Gửi push notification
    if (parentComment.User.id !== user_id) { // Không gửi nếu tự reply chính mình
      await sendPushNotification(
        parentComment.User.id,
        'Có người trả lời bình luận',
        `${replier.name} đã trả lời bình luận của bạn`,
        {
          type: 'comment_reply',
          exercise_id,
          comment_id: reply.id
        }
      );
    }

    res.status(201).json({
      success: true,
      data: reply
    });

  } catch (error) {
    console.error("Lỗi khi reply comment:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};

module.exports = {
  getComments,
  addComment,
  replyComment
};