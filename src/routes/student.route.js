const express = require('express');
const router = express.Router();
const { getStudentRankings } = require('../controllers/student.controller');
const { authenticateToken, isStudent } = require('../middlewares/auth.middleware');
// All routes in this file require authentication and teacher role
router.use(authenticateToken, isStudent);
// Protected route - requires student authentication
router.get('/rankings', getStudentRankings);

module.exports = router;