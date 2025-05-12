const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/connectDB");
const User = require("./user.model");
const Exercise = require("./exercise.model");

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sentTime: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "sent_time",
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_read",
    },
    notificationType: {
      type: DataTypes.ENUM("assignment", "comment"),
      allowNull: false,
      field: "notification_type",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    tableName: "notifications",
    timestamps: false,
  }
);
module.exports = Notification;