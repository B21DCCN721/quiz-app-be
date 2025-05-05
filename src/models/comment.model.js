const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/connectDB");
const User = require("./user.model");
const Exercise = require("./exercise.model");

const Comment = sequelize.define(
  "Comment",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    exercise_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Exercise,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'comments',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  },
  {
    tableName: "comments",
    timestamps: false,
  }
);

// Self-referencing để lấy replies
Comment.hasMany(Comment, { as: 'replies', foreignKey: 'parent_id' });
Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parent_id' });

module.exports = Comment;
