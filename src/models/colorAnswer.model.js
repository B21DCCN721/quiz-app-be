const { DataTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');
const ColorQuestion = require('./colorQuestion.model'); 

const ColorAnswer = sequelize.define('ColorAnswer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ColorQuestion, // tên bảng trong cơ sở dữ liệu
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  correct_position: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'color_answers',
  timestamps: false
});

module.exports = ColorAnswer;