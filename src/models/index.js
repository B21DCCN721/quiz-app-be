const User = require("./user.model");
const Student = require("./student.model");
const Exercise = require("./exercise.model");
const MultipleChoiceQuestion = require("./multipleChoiceQuestion.model");
const MultipleChoiceAnswer = require("./multipleChoiceAnswer.model");
const CountingQuestion = require("./countingQuestion.model");
const CountingAnswer = require("./countingAnswer.model");
const ColorQuestion = require("./colorQuestion.model");
const ColorAnswer = require("./colorAnswer.model");
const Submission = require("./submission.model");
const StudentAnswerMultipleChoice = require('./studentAnswerMultipleChoice.model');
const StudentAnswerCounting = require('./studentAnswerCounting.model');
const StudentAnswerColor = require('./studentAnswerColor.model');
const Comment = require('./comment.model');
const Notification = require('./notification.model');

// User - Student relationship
User.hasOne(Student, { foreignKey: 'user_id' });
Student.belongsTo(User, { foreignKey: 'user_id' });

// User - Exercise relationship
User.hasMany(Exercise, { foreignKey: 'user_id' });
Exercise.belongsTo(User, { foreignKey: 'user_id' });

// Exercise - Questions relationships
Exercise.hasMany(MultipleChoiceQuestion, { foreignKey: 'exercise_id' });
MultipleChoiceQuestion.belongsTo(Exercise, { foreignKey: 'exercise_id' });

Exercise.hasMany(CountingQuestion, { foreignKey: 'exercise_id' });
CountingQuestion.belongsTo(Exercise, { foreignKey: 'exercise_id' });

Exercise.hasMany(ColorQuestion, { foreignKey: 'exercise_id' });
ColorQuestion.belongsTo(Exercise, { foreignKey: 'exercise_id' });

// Questions - Answers relationships
MultipleChoiceQuestion.hasMany(MultipleChoiceAnswer, { foreignKey: 'question_id' });
MultipleChoiceAnswer.belongsTo(MultipleChoiceQuestion, { foreignKey: 'question_id' });

CountingQuestion.hasMany(CountingAnswer, { foreignKey: 'question_id' });
CountingAnswer.belongsTo(CountingQuestion, { foreignKey: 'question_id' });

ColorQuestion.hasMany(ColorAnswer, { foreignKey: 'question_id' });
ColorAnswer.belongsTo(ColorQuestion, { foreignKey: 'question_id' });

// Student - Submission relationship
Student.hasMany(Submission, { foreignKey: 'student_id' });
Submission.belongsTo(Student, { foreignKey: 'student_id' });

// Exercise - Submission relationship
Exercise.hasMany(Submission, { foreignKey: 'exercise_id' });
Submission.belongsTo(Exercise, { foreignKey: 'exercise_id' });

// Submission - StudentAnswer relationship
Submission.hasMany(StudentAnswerMultipleChoice, { foreignKey: 'submission_id' });
StudentAnswerMultipleChoice.belongsTo(Submission, { foreignKey: 'submission_id' });

Submission.hasMany(StudentAnswerCounting, { foreignKey: 'submission_id' });
StudentAnswerCounting.belongsTo(Submission, { foreignKey: 'submission_id' });

Submission.hasMany(StudentAnswerColor, { foreignKey: 'submission_id' });
StudentAnswerColor.belongsTo(Submission, { foreignKey: 'submission_id' });

// Question - StudentAnswer relationships
MultipleChoiceQuestion.hasMany(StudentAnswerMultipleChoice, { foreignKey: 'question_id' });
StudentAnswerMultipleChoice.belongsTo(MultipleChoiceQuestion, { foreignKey: 'question_id' });

CountingQuestion.hasMany(StudentAnswerCounting, { foreignKey: 'question_id' });
StudentAnswerCounting.belongsTo(CountingQuestion, { foreignKey: 'question_id' });

ColorQuestion.hasMany(StudentAnswerColor, { foreignKey: 'question_id' });
StudentAnswerColor.belongsTo(ColorQuestion, { foreignKey: 'question_id' });

// Comment relationships
User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

Exercise.hasMany(Comment, { foreignKey: 'exercise_id' });
Comment.belongsTo(Exercise, { foreignKey: 'exercise_id' });
// noti relationships
User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

Exercise.hasMany(Notification, { foreignKey: 'exercise_id' });
Notification.belongsTo(Exercise, { foreignKey: 'exercise_id' });

module.exports = {
  User,
  Student,
  Exercise,
  MultipleChoiceQuestion,
  MultipleChoiceAnswer,
  CountingQuestion,
  CountingAnswer,
  ColorQuestion,
  ColorAnswer,
  Submission,
  StudentAnswerMultipleChoice,
  StudentAnswerCounting,
  StudentAnswerColor,
  Comment,
  Notification
};