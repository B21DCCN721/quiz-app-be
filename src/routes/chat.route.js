const express = require("express");
const router = express.Router();
const { aiGemini } = require("../services/googleAuth.service");

router.post("/ask-ai", aiGemini);

module.exports = router;