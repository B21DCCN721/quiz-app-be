const { DataTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');
const Submission = require('./submission.model');
const CountingQuestion = require('./countingQuestion.model');

const StudentAnswerCounting = sequelize.define('StudentAnswerCounting', {
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
      model: CountingQuestion,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  selected_answer: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'student_answers_counting',
  timestamps: false
});

module.exports = StudentAnswerCounting;