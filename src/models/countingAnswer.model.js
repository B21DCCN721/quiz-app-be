const { DataTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');
const CountingQuestion = require('./countingQuestion.model'); 

const CountingAnswer = sequelize.define('CountingAnswer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: CountingQuestion, // tên bảng trong cơ sở dữ liệu
      key: 'id'
    },
    onDelete: 'CASCADE' 
  },
  object_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  correct_count: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'counting_answers',
  timestamps: false
});

module.exports = CountingAnswer;