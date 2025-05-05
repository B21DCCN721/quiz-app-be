const express = require("express");
const { getUserHistory ,getHistoryResult,getHistoryDetailMultipleChoice,getHistoryDetailCountingQuestion,getHistoryDetailColorQuestion} = require("../controllers/history.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

const router = express.Router();
router.get("/", authenticateToken, getUserHistory);
router.get("/result/:id",authenticateToken ,getHistoryResult);
router.get("/result/multiple-choice/:id", authenticateToken, getHistoryDetailMultipleChoice);
router.get("/result/counting/:id", authenticateToken, getHistoryDetailCountingQuestion); 
router.get("/result/color/:id", authenticateToken, getHistoryDetailColorQuestion);
module.exports = router;