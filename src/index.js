 const express = require("express");
const app = express();
require('dotenv').config();
const port = process.env.PORT || 2804;
const route = require("./routes");
const cors = require("cors");
const { connection } = require("./configs/connectDB");

//config req body
app.use(express.json()); // for json
app.use(express.urlencoded({ extended: true })); // for form data

//cors
app.use(cors());

// routes
route(app);

// Trong ứng dụng Express
app.listen(5000, async () => {
  try {
    await connection();
    console.log("Server started on port 5000");
  } catch (err) {
    console.error("Failed to start server:", err);
  }
});
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app"); // Express app

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Cho phép mọi nguồn gốc (hoặc cấu hình cụ thể)
  },
});

// Lắng nghe kết nối từ client
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Lắng nghe sự kiện ngắt kết nối
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Xuất `io` để sử dụng trong các controller
module.exports = io;

// Khởi động server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});