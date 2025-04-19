const { DataTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');
const Exercise = require('./exercise.model'); 

const MultipleChoiceQuestion = sequelize.define('MultipleChoiceQuestion', {
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
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'multiple_choice_questions',
  timestamps: false
});

module.exports = MultipleChoiceQuestion;