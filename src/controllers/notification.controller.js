const { Notification, User, Exercise } = require("../models");
const markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findByPk(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Thông báo không tồn tại",
      });
    }

    notification.is_read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Đã đánh dấu thông báo là đã đọc",
    });
  } catch (error) {
    console.error("Lỗi khi đánh dấu thông báo là đã đọc:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

module.exports = {
  markNotificationAsRead,
};
const getNotifications = async (req, res) => {
  const user_id = req.user.id; // Lấy user_id từ middleware auth

  try {
    const notifications = await Notification.findAll({
      where: { user_id },
      include: [
        {
          model: Exercise,
          attributes: ["id", "title"], // Lấy thông tin bài tập (nếu có)
        },
      ],
      order: [["created_at", "DESC"]], // Sắp xếp theo thời gian mới nhất
    });

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thông báo:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

module.exports = {
  getNotifications,
};