const { DataTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');
const Submission = require('./submission.model');
const MultipleChoiceQuestion = require('./multipleChoiceQuestion.model'); 

const StudentAnswerMultipleChoice = sequelize.define('StudentAnswerMultipleChoice', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  submission_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Submission, 
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: MultipleChoiceQuestion, 
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  selected_answer: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'student_answers_multiple_choice',
  timestamps: false
});

module.exports = StudentAnswerMultipleChoice;