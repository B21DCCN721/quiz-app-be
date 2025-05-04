const express = require("express");
const router = express.Router();
const { getComments, addComment } = require("../controllers/comment.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");
router.get("/:exerciseId",authenticateToken, getComments);

router.post("/",authenticateToken, addComment);

module.exports = router;