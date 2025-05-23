require("dotenv").config();
const { Op } = require("sequelize");
const { User, Student } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateOTP = require("../helpers/generateOTP");
const { sendOTPEmail } = require("../services/googleAuth.service");
// Store OTP temporarily (in production, use Redis or similar)
const otpStore = require("../helpers/otpStrore");

// Register controller for both student and teacher
const register = async (req, res) => {
  try {
    const { email, password, name, role, grade } = req.body;

    // Check if email exists
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({
        code: 0,
        message: "Email đã tồn tại",
      });
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
      code: 1,
      message: "Đăng ký thành công",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        ...(newUser.role === "student" && {
          grade: grade,
          score: 0,
        }),
      },
    });
  } catch (error) {
    res.status(500).json({
      code: 0,
      message: "Lỗi server",
      error: error.message,
    });
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
      return res.status(400).json({
        code: 0,
        message: "Email không đúng",
      });
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({
        code: 0,
        message: "Mật khẩu không đúng",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        ...(user.Student && { grade: user.Student.grade }),
      },
      process.env.JWT_SECRET
      // { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      code: 1,
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
    res.status(500).json({
      code: 0,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        code: 0,
        message: "Không tìm thấy người dùng",
      });
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(
      oldPassword,
      user.password_hash
    );
    if (!isValidPassword) {
      return res.status(400).json({
        code: 0,
        message: "Mật khẩu cũ không đúng",
      });
    }
    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password_hash
    );
    if (isSamePassword) {
      return res.status(400).json({
        code: 0,
        message: "Mật khẩu mới không được giống mật khẩu cũ",
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await user.update({ password_hash: hashedNewPassword });

    res.json({
      code: 1,
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    res.status(500).json({
      code: 0,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const changePasswordAdmin = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        code: 0,
        message: "Không tìm thấy người dùng",
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await user.update({ password_hash: hashedNewPassword });

    res.json({
      code: 1,
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    res.status(500).json({
      code: 0,
      message: "Lỗi server",
      error: error.message,
    });
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
      return res
        .status(404)
        .json({ code: 0, message: "Không tìm thấy người dùng" });
    }

    res.json({
      code: 1,
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
    res.status(500).json({
      code: 0,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, grade, avatar, email } = req.body;

    // Validate base64 image string if provided
    if (avatar && !avatar.match(/^data:image\/(png|jpg|jpeg);base64,/)) {
      return res.status(400).json({
        code: 0,
        message: "Avatar phải là ảnh định dạng base64 (PNG, JPG, JPEG)",
      });
    }

    // If email is provided, check if it's already in use
    if (email) {
      const existingUser = await User.findOne({
        where: {
          email,
          id: { [Op.ne]: userId }, // Exclude current user
        },
      });

      if (existingUser) {
        return res.status(400).json({
          code: 0,
          message: "Email đã được sử dụng bởi người dùng khác",
        });
      }
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
      return res.status(404).json({
        code: 0,
        message: "Không tìm thấy người dùng",
      });
    }

    // Update user info
    const updateData = { name };
    if (avatar) updateData.avatar = avatar;
    if (email) updateData.email = email;
    await user.update(updateData);

    // Update student grade if user is student
    // Update student grade if user is student
    if (user.role === "student" && grade) {
      const currentGrade = user.Student?.grade;

      if (currentGrade !== grade) {
        await user.Student.update({ grade, score: 0 });
      }
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
      code: 1,
      message: "Cập nhật thông tin thành công",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        ...(updatedUser.Student && {
          grade: updatedUser.Student.grade,
          score: updatedUser.Student.score,
        }),
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: 0,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        code: 0,
        message: "Email không tồn tại trong hệ thống",
      });
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
      code: 1,
      message: "Mã OTP đã được gửi đến email của bạn",
      email,
      otp,
    });
  } catch (error) {
    res.status(500).json({
      code: 0,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ code: 0, message: "Email không tồn tại trong hệ thống" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password_hash: hashedPassword });

    // Clear OTP sau khi đổi mật khẩu thành công
    otpStore.delete(email);

    res.json({ code: 1, message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    res
      .status(500)
      .json({ code: 0, message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  register,
  login,
  changePassword,
  updateProfile,
  getProfile,
  forgotPassword,
  resetPassword,
  changePasswordAdmin,
};
