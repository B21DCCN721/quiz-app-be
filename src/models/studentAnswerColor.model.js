const { DataTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');
const Submission = require('./submission.model');
const ColorQuestion = require('./colorQuestion.model'); 

const StudentAnswerColor = sequelize.define('StudentAnswerColor', {
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
      model: ColorQuestion, 
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  selected_answer: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'student_answers_color',
  timestamps: false
});

module.exports = StudentAnswerColor;