const express = require('express');
const router = express.Router();
const { authenticateToken, isTeacher } = require('../middlewares/auth.middleware');

// All routes in this file require authentication and teacher role
router.use(authenticateToken, isTeacher);

router.post('/exercises', (req, res) => {
  // Create exercise logic
});

module.exports = router;