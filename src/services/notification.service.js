const { Expo } = require('expo-server-sdk');
const { User, Notification } = require('../models');

const expo = new Expo();

const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    // Lấy token Expo của user
    const user = await User.findByPk(userId);
    if (!user || !user.expo_push_token) return;

    // Kiểm tra token hợp lệ
    if (!Expo.isExpoPushToken(user.expo_push_token)) {
      console.error(`Invalid Expo push token: ${user.expo_push_token}`);
      return;
    }

    // Tạo message
    const message = {
      to: user.expo_push_token,
      sound: 'default',
      title,
      body,
      data,
      badge: 1,
    };

    // Gửi notification
    const chunks = expo.chunkPushNotifications([message]);
    for (let chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error('Error sending chunk:', error);
      }
    }

  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

module.exports = { sendPushNotification };