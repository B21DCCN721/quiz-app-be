const { DataTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');
const Submission = require('./submission.model');

const StudentAnswer = sequelize.define('StudentAnswer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  submission_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Submission, // tên bảng trong cơ sở dữ liệu
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'MultipleChoiceQuestion', // tên bảng trong cơ sở dữ liệu
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  selected_answer: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'student_answers',
  timestamps: false
});

module.exports = StudentAnswer;