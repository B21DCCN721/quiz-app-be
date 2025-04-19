const express = require('express');
const router = express.Router();
const { getAllExercises, getExerciseDetail } = require('../controllers/exercise.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { exerciseFilterMiddleware } = require('../middlewares/exercise.middleware');

// Protected route with filters
router.get('/', authenticateToken, exerciseFilterMiddleware, getAllExercises);
router.get('/:id', authenticateToken, getExerciseDetail);
module.exports = router;