const authRoute = require('./auth.route');
const teacherRoute = require('./teacher.route');
const studentRoute = require('./student.route');
const exerciseRoute = require('./exercise.route');
const historyRoute = require('./history.route');
const commentRoute = require('./comment.route'); 
function route(app) {
    app.use('/api/auth', authRoute);
    app.use('/api/teacher', teacherRoute);
    app.use('/api/student', studentRoute);
    app.use('/api/exercises', exerciseRoute);
    app.use('/api/history', historyRoute);
    app.use('/api/comments', commentRoute); 
}

module.exports = route;