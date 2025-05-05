const express = require('express');
const router = express.Router();
const { getStudentRankings, submitMultipleChoiceExercise, submitColorExercise, submitCountingExercise } = require('../controllers/student.controller');
const { authenticateToken, isStudent } = require('../middlewares/auth.middleware');
// All routes in this file require authentication and teacher role
router.use(authenticateToken, isStudent);
// Protected route - requires student authentication
router.get('/rankings', getStudentRankings);
router.post('/submit/multiple-choice', submitMultipleChoiceExercise);
router.post('/submit/color', submitColorExercise); 
router.post('/submit/counting', submitCountingExercise); // Assuming the same function handles both types of submissions

module.exports = router;