const { DataTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');
const User = require('./user.model'); 
const Exercise = require('./exercise.model');

const Submission = sequelize.define('Submission', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User, // tên bảng trong cơ sở dữ liệu
      key: 'id'
    },
    onDelete: 'CASCADE'
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
  score: {
    type: DataTypes.INTEGER
  },
  submitted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'submissions',
  timestamps: false
});

module.exports = Submission;