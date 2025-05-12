const express = require('express');
const router = express.Router();
const { authenticateToken, isTeacher } = require('../middlewares/auth.middleware');
const {
  createMultipleChoiceExercise,
  editMultipleChoiceExercise,
  createCountingExercise,
  editCountingExercise,
  createColorExercise,
  editColorExercise,
  deleteExercise
} = require('../controllers/exercise.controller');
const { upload } = require('../configs/cloudinary.config');

// All routes in this file require authentication and teacher role
router.use(authenticateToken, isTeacher);

router.post('/exercises/create/multiple-choice', createMultipleChoiceExercise);
router.post('/exercises/create/counting', upload.array('images'), createCountingExercise);
router.post('/exercises/create/color', upload.array('images'), createColorExercise);
router.put('/exercises/update/multiple-choice/:id', editMultipleChoiceExercise);
router.put('/exercises/update/counting/:id', upload.array('images'), editCountingExercise);
router.put('/exercises/update/color/:id', upload.array('images'), editColorExercise);
router.delete('/exercises/delete/:id', deleteExercise);

module.exports = router;