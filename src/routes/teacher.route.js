const express = require('express');
const router = express.Router();
const { authenticateToken, isTeacher } = require('../middlewares/auth.middleware');
const {
  createMultipleChoiceExercise,
  createCountingExercise,
  createColorExercise,
  deleteExercise
} = require('../controllers/exercise.controller');
const { upload } = require('../configs/cloudinary.config');

// All routes in this file require authentication and teacher role
router.use(authenticateToken, isTeacher);

router.post('/exercises/create/multiple-choice', createMultipleChoiceExercise);
router.post('/exercises/create/counting', upload.array('images'), createCountingExercise);
router.post('/exercises/create/color', upload.array('images'), createColorExercise);
router.delete('/exercises/delete/:id', deleteExercise);

module.exports = router;