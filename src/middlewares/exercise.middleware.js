const { Op } = require('sequelize');
const { sequelize } = require('../configs/connectDB');

const exerciseFilterMiddleware = (req, res, next) => {
  const { type, grade, search, id } = req.query;
  const whereClause = {};

  // Filter by id
  if (id) {
    whereClause.id = id;
  }

  // Filter by exercise type
  if (type) {
    whereClause.exercise_type = type;
  }

  // Filter by grade
  if (grade) {
    whereClause.grade = grade;
  }

  // Search in title or description
  if (search) {
    whereClause[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { id: { [Op.like]: `%${search}%` } }
    ];
  }

  // Add filters to request object
  req.filters = { where: whereClause };
  next();
};

module.exports = { exerciseFilterMiddleware };