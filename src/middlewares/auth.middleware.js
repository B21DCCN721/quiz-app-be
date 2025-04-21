const jwt = require("jsonwebtoken");
require("dotenv").config();
const otpStore = require("../helpers/otpStrore");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      code: 0,
      message: "Không tìm thấy token xác thực",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      code: 0,
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};

// Middleware to check if user is a teacher
const isTeacher = (req, res, next) => {
  if (req.user.role !== "teacher") {
    return res.status(403).json({
      code: 0,
      message: "Chỉ giáo viên mới có quyền truy cập",
    });
  }
  next();
};

// Middleware to check if user is a student
const isStudent = (req, res, next) => {
  if (req.user.role !== "student") {
    return res.status(403).json({
      code: 0,
      message: "Chỉ học sinh mới có quyền truy cập",
    });
  }
  next();
};

const verifyOTP = (req, res, next) => {
  const { email, otp } = req.body;

  const otpData = otpStore.get(email);
  if (!otpData) {
    return res.status(400).json({ code: 0, message: "OTP không tồn tại." });
  }

  if (Date.now() - otpData.timestamp > 5 * 60 * 1000) {
    otpStore.delete(email);
    return res.status(400).json({ code: 0, message: "OTP đã hết hạn" });
  }

  if (otpData.attempts >= 3) {
    otpStore.delete(email);
    return res.status(400).json({
      code: 0,
      message: "Đã vượt quá số lần thử. Vui lòng yêu cầu OTP mới",
    });
  }

  if (otpData.otp !== otp) {
    otpData.attempts++;
    return res.status(400).json({ code: 0, message: "OTP không chính xác" });
  }

  // OTP hợp lệ, tiếp tục đi
  next();
};

module.exports = { authenticateToken, isTeacher, isStudent, verifyOTP };
