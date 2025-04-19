const { DataTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');
const MultipleChoiceQuestion = require('./multipleChoiceQuestion.model'); 

const MultipleChoiceAnswer = sequelize.define('MultipleChoiceAnswer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: MultipleChoiceQuestion, // tên bảng trong cơ sở dữ liệu
      key: 'id'
    },
    onDelete: 'CASCADE' 
  },
  answer_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'multiple_choice_answers',
  timestamps: false
});

module.exports = MultipleChoiceAnswer;