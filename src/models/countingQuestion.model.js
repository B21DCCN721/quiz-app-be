const { DataTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');
const Exercise = require('./exercise.model');

const CountingQuestion = sequelize.define('CountingQuestion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  exercise_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Exercise, // tên bảng trong cơ sở dữ liệu
      key: 'id'
    },
    onDelete: 'CASCADE' 
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  public_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  question_text: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'counting_questions',
  timestamps: false
});

module.exports = CountingQuestion;