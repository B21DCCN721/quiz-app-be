const { DataTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');

const ColorQuestion = sequelize.define('ColorQuestion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  exercise_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'color_questions',
  timestamps: false
});

module.exports = ColorQuestion;