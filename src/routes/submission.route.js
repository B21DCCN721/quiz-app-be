const express = require("express");
const router = express.Router();
const {
  getSubmissionsByExercise,
  getSubmissionDetail
} = require("../controllers/submission.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// Public routes
router.get("/exercise/:exercise_id", authenticateToken, getSubmissionsByExercise);
router.get("/:id", authenticateToken, getSubmissionDetail);
module.exports = router;
