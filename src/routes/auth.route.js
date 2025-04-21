const express = require("express");
const router = express.Router();
const {
  register,
  login,
  changePassword,
  updateProfile,
  getProfile,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");
const { authenticateToken, verifyOTP } = require("../middlewares/auth.middleware");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", verifyOTP, resetPassword);

// Protected route example
router.get("/profile", authenticateToken, getProfile);
router.post("/change-password", authenticateToken, changePassword);
router.put("/change-profile", authenticateToken, updateProfile);

module.exports = router;
