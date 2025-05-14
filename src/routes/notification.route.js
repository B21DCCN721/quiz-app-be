const express = require("express");
const router = express.Router();
const {getNotifications} = require("../controllers/notification.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.get("/", authenticateToken, getNotifications);


module.exports = router;