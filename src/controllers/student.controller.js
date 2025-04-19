const { User, Student } = require("../models");

const getStudentRankings = async (req, res) => {
  try {
    const userGrade = req.user.grade; // Grade from authenticated student's token

    const students = await User.findAll({
      where: {
        role: 'student'
      },
      include: [{
        model: Student,
        where: {
          grade: userGrade // Filter by same grade
        },
        required: true
      }],
      attributes: ['id', 'name', 'email'],
      order: [
        [Student, 'score', 'DESC'], // Sort by score descending
        ['name', 'ASC'] // If scores are equal, sort by name ascending
      ]
    });

    // Map the results to include ranking
    const rankings = students.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      name: user.name,
      email: user.email,
      score: user.Student.score
    }));

    res.json({
      message: "Lấy danh sách xếp hạng thành công",
      rankings
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message
    });
  }
};

module.exports = {
  getStudentRankings
};