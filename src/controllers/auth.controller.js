require("dotenv").config();
const { User, Student } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateOTP = require("../helpers/generateOTP");
const { sendOTPEmail } = require("../services/googleAuth.service");
// Store OTP temporarily (in production, use Redis or similar)
const otpStore = new Map();

// Register controller for both student and teacher
const register = async (req, res) => {
  try {
    const { email, password, name, role, grade } = req.body;

    // Check if email exists
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      email,
      password_hash: hashedPassword,
      name,
      role,
    });

    // If role is student, create student record
    if (role === "student") {
      await Student.create({
        user_id: newUser.id,
        grade: grade,
        score: 0,
      });
    }

    res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Login controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Student,
          required: false, // Left join to get student info if exists
        },
      ],
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Email không đúng" });
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res
        .status(400)
        .json({ message: "Mật khẩu không đúng" });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        ...(user.Student && { grade: user.Student.grade }),
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: "Đăng nhập thành công",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        ...(user.Student && {
          grade: user.Student.grade,
          score: user.Student.score,
        }),
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // From auth middleware

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(
      oldPassword,
      user.password_hash
    );
    if (!isValidPassword) {
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
    }
    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password_hash
    );
    if (isSamePassword) {
      return res
        .status(400)
        .json({ message: "Mật khẩu mới không được giống mật khẩu cũ" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await user.update({ password_hash: hashedNewPassword });

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    const user = await User.findOne({
      where: { id: userId },
      include: [
        {
          model: Student,
          required: false,
        },
      ],
      attributes: ["id", "email", "name", "role", "avatar"],
    });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json({
      message: "Lấy thông tin người dùng thành công",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        ...(user.Student && {
          grade: user.Student.grade,
          score: user.Student.score,
        }),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, grade, avatar } = req.body;

    // Validate base64 image string if provided
    if (avatar && !avatar.match(/^data:image\/(png|jpg|jpeg);base64,/)) {
      return res.status(400).json({
        message: "Avatar phải là ảnh định dạng base64 (PNG, JPG, JPEG)",
      });
    }

    // Find user with student info if exists
    const user = await User.findOne({
      where: { id: userId },
      include: [
        {
          model: Student,
          required: false,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Update user info
    const updateData = { name };
    if (avatar) {
      updateData.avatar = avatar;
    }
    await user.update(updateData);

    // Update student grade if user is student
    if (user.role === "student" && grade) {
      await user.Student.update({ grade });
    }

    // Get updated user data
    const updatedUser = await User.findOne({
      where: { id: userId },
      include: [
        {
          model: Student,
          required: false,
        },
      ],
    });

    res.json({
      message: "Cập nhật thông tin thành công",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        ...(updatedUser.Student && {
          grade: updatedUser.Student.grade,
          score: updatedUser.Student.score,
        }),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Email không tồn tại trong hệ thống" });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP with timestamp
    otpStore.set(email, {
      otp,
      timestamp: Date.now(),
      attempts: 0,
    });

    // Send OTP via email
    await sendOTPEmail(email, otp);
    console.log(`[DEBUG] OTP cho ${email}: ${otp}`);

    res.json({
      message: "Mã OTP đã được gửi đến email của bạn",
      email,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Check if OTP exists and is valid
    const otpData = otpStore.get(email);
    if (!otpData) {
      return res
        .status(400)
        .json({ message: "OTP không tồn tại hoặc đã hết hạn" });
    }

    // Check OTP expiration (5 minutes)
    if (Date.now() - otpData.timestamp > 5 * 60 * 1000) {
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP đã hết hạn" });
    }

    // Check if max attempts reached
    if (otpData.attempts >= 3) {
      otpStore.delete(email);
      return res
        .status(400)
        .json({ message: "Đã vượt quá số lần thử. Vui lòng yêu cầu OTP mới" });
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      otpData.attempts++;
      return res.status(400).json({ message: "OTP không chính xác" });
    }

    // Find user and update password
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password_hash: hashedPassword });

    // Clear OTP
    otpStore.delete(email);

    res.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  register,
  login,
  changePassword,
  updateProfile,
  getProfile,
  forgotPassword,
  verifyOTP,
};
