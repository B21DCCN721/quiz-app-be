-- Create database
DROP DATABASE IF EXISTS btl_mad;
CREATE DATABASE btl_mad;
USE btl_mad;

-- Create tables
CREATE TABLE users (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       name VARCHAR(255) NOT NULL,
                       role ENUM('student', 'teacher') NOT NULL,
                       avatar LONGTEXT,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE students (
                          user_id INT PRIMARY KEY,
                          grade int NOT NULL,
                          score int default 0,
                          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE exercises (
                           id INT AUTO_INCREMENT PRIMARY KEY,
                           exercise_type int NOT NULL,
                           grade int NOT NULL,
                           user_id INT NOT NULL,
                           title VARCHAR(255),
                           description TEXT,
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                           FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE multiple_choice_questions (
                                           id INT AUTO_INCREMENT PRIMARY KEY,
                                           exercise_id INT NOT NULL,
                                           question TEXT NOT NULL,
                                           FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

CREATE TABLE multiple_choice_answers (
                                         id INT AUTO_INCREMENT PRIMARY KEY,
                                         question_id INT NOT NULL,
                                         answer_text TEXT NOT NULL,
                                         is_correct BOOLEAN NOT NULL DEFAULT FALSE,
                                         FOREIGN KEY (question_id) REFERENCES multiple_choice_questions(id) ON DELETE CASCADE
);

CREATE TABLE counting_questions (
                                    id INT AUTO_INCREMENT PRIMARY KEY,
                                    exercise_id INT NOT NULL,
                                    image_url VARCHAR(255) NOT NULL,
                                    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

CREATE TABLE counting_answers (
                                  id INT AUTO_INCREMENT PRIMARY KEY,
                                  question_id INT NOT NULL,
                                  object_name VARCHAR(255) NOT NULL,
                                  correct_count INT NOT NULL,
                                  FOREIGN KEY (question_id) REFERENCES counting_questions(id) ON DELETE CASCADE
);

CREATE TABLE color_questions (
                                 id INT AUTO_INCREMENT PRIMARY KEY,
                                 exercise_id INT NOT NULL,
                                 image_url VARCHAR(255) NOT NULL,
                                 FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

CREATE TABLE color_answers (
                               id INT AUTO_INCREMENT PRIMARY KEY,
                               question_id INT NOT NULL,
                               correct_position INT NOT NULL,
                               FOREIGN KEY (question_id) REFERENCES color_questions(id) ON DELETE CASCADE
);

CREATE TABLE submissions (
                             id INT AUTO_INCREMENT PRIMARY KEY,
                             student_id INT NOT NULL,
                             exercise_id INT NOT NULL,
                             score INT,
                             submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                             FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE,
                             FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

CREATE TABLE student_answers_multiple_choice (
                                 id INT AUTO_INCREMENT PRIMARY KEY,
                                 submission_id INT NOT NULL,
                                 question_id INT NOT NULL,
                                 selected_answer int NOT NULL,
                                 FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
                                 FOREIGN KEY (question_id) REFERENCES multiple_choice_questions(id) ON DELETE CASCADE
);
CREATE TABLE student_answers_counting (
                                 id INT AUTO_INCREMENT PRIMARY KEY,
                                 submission_id INT NOT NULL,
                                 question_id INT NOT NULL,
                                 selected_answer TEXT NOT NULL,
                                 FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
                                 FOREIGN KEY (question_id) REFERENCES counting_questions(id) ON DELETE CASCADE
);
CREATE TABLE student_answers_color (
                                 id INT AUTO_INCREMENT PRIMARY KEY,
                                 submission_id INT NOT NULL,
                                 question_id INT NOT NULL,
                                 selected_answer TEXT NOT NULL,
                                 FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
                                 FOREIGN KEY (question_id) REFERENCES color_questions(id) ON DELETE CASCADE
);
-- Bình luận bài tập
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    exercise_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);
-- Thông báo
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exercise_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    sent_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    notification_type ENUM('assignment', 'comment') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);
ALTER TABLE comments ADD COLUMN parent_id BIGINT UNSIGNED NULL, ADD CONSTRAINT fk_parent_id FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
alter table counting_questions add column public_id VARCHAR(255);
alter table color_questions add column public_id VARCHAR(255);
-- Insert data
INSERT INTO users (email, password_hash, name, role) VALUES
                                                         ('student1@example.com', 'hashed_password_1', 'Nguyen Van A', 'student'),
                                                         ('student2@example.com', 'hashed_password_2', 'Tran Thi B', 'student'),
                                                         ('teacher1@example.com', 'hashed_password_3', 'Le Van C', 'teacher'),
                                                         ('student3@example.com', 'hashed_password_4', 'Hoang Minh D', 'student'),
                                                         ('teacher2@example.com', 'hashed_password_5', 'Pham Thi E', 'teacher');

INSERT INTO students (user_id, grade) VALUES
                                          ((SELECT id FROM users WHERE email = 'student1@example.com'), '1'),
                                          ((SELECT id FROM users WHERE email = 'student2@example.com'), '2'),
                                          ((SELECT id FROM users WHERE email = 'student3@example.com'), '1');

-- Exercise 1 (Multiple Choice)
INSERT INTO exercises (exercise_type, grade, user_id, title) VALUES (1, '1', 3, 'General Knowledge Quiz');
SET @exercise_id = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Thủ đô của Pháp là gì?');
SET @q1 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, '2 + 2 bằng mấy?');
SET @q2 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Nguyên tố hóa học có ký hiệu O là gì?');
SET @q3 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Ai viết tác phẩm \"Truyện Kiều\"?');
SET @q4 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Nước nào có diện tích lớn nhất thế giới?');
SET @q5 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Hệ điều hành nào được sử dụng phổ biến trên điện thoại?');
SET @q6 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Tốc độ ánh sáng xấp xỉ bao nhiêu km/s?');
SET @q7 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Đâu là một ngôn ngữ lập trình?');
SET @q8 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Trái Đất quay quanh gì?');
SET @q9 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Nước nào có dân số đông nhất thế giới?');
SET @q10 = LAST_INSERT_ID();
INSERT INTO multiple_choice_answers (question_id, answer_text, is_correct) VALUES
                                                                               (@q1, 'Paris', TRUE), (@q1, 'London', FALSE), (@q1, 'Berlin', FALSE), (@q1, 'Madrid', FALSE),
                                                                               (@q2, '3', FALSE), (@q2, '4', TRUE), (@q2, '5', FALSE), (@q2, '6', FALSE),
                                                                               (@q3, 'Oxygen', TRUE), (@q3, 'Hydrogen', FALSE), (@q3, 'Carbon', FALSE), (@q3, 'Nitrogen', FALSE),
                                                                               (@q4, 'Nguyễn Du', TRUE), (@q4, 'Hồ Xuân Hương', FALSE), (@q4, 'Tố Hữu', FALSE), (@q4, 'Xuân Diệu', FALSE),
                                                                               (@q5, 'Nga', TRUE), (@q5, 'Mỹ', FALSE), (@q5, 'Trung Quốc', FALSE), (@q5, 'Ấn Độ', FALSE),
                                                                               (@q6, 'Windows', FALSE), (@q6, 'Linux', FALSE), (@q6, 'Android', TRUE), (@q6, 'MacOS', FALSE),
                                                                               (@q7, '300,000 km/s', TRUE), (@q7, '150,000 km/s', FALSE), (@q7, '500,000 km/s', FALSE), (@q7, '100,000 km/s', FALSE),
                                                                               (@q8, 'Java', TRUE), (@q8, 'HTML', FALSE), (@q8, 'CSS', FALSE), (@q8, 'Photoshop', FALSE),
                                                                               (@q9, 'Mặt Trời', TRUE), (@q9, 'Mặt Trăng', FALSE), (@q9, 'Sao Hỏa', FALSE), (@q9, 'Sao Kim', FALSE),
                                                                               (@q10, 'Trung Quốc', TRUE), (@q10, 'Ấn Độ', FALSE), (@q10, 'Mỹ', FALSE), (@q10, 'Indonesia', FALSE);

-- Exercise 2 (Multiple Choice)
INSERT INTO exercises (exercise_type, grade, user_id, title) VALUES (1, '2', 3, 'Math and Numbers Quiz');
SET @exercise_id = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Số Hai mươi ba nghìn tám trăm linh năm được viết là:');
SET @q1 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Chữ số 4 trong số 64 963 thuộc hàng nào?');
SET @q2 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Số 13 786 được đọc là');
SET @q3 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Giá trị của chữ số 5 trong số 85 246 là:');
SET @q4 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Làm tròn số 44 300 đến hàng chục nghìn thì được số');
SET @q5 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Số tròn chục liền trước số một trăm nghìn viết là:');
SET @q6 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Tốc độ ánh sáng xấp xỉ bao nhiêu km/s?');
SET @q7 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Đâu là một ngôn ngữ lập trình?');
SET @q8 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Trái Đất quay quanh gì?');
SET @q9 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Nước nào có dân số đông nhất thế giới?');
SET @q10 = LAST_INSERT_ID();
INSERT INTO multiple_choice_answers (question_id, answer_text, is_correct) VALUES
                                                                               (@q1, '23 508', FALSE), (@q1, ' 23 805', TRUE), (@q1, '2 385', FALSE), (@q1, '32 835', FALSE),
                                                                               (@q2, 'Hàng chục nghìn', FALSE), (@q2, 'Hàng nghìn', TRUE), (@q2, 'Hàng trăm', FALSE), (@q2, 'Hàng chục', FALSE),
                                                                               (@q3, 'Mười ba nghìn sáu trăm tám mươi sáu.', FALSE), (@q3, 'Sáu mươi tám nghìn bảy trăm ba mươi mốt.', FALSE), (@q3, 'Mười ba nghìn bảy trăm tám mươi sáu.', TRUE), (@q3, 'Một ba bảy tám sáu.', FALSE),
                                                                               (@q4, '50', FALSE), (@q4, '500', FALSE), (@q4, '5000', TRUE), (@q4, '50000', FALSE),
                                                                               (@q5, '40000', TRUE), (@q5, '45000', FALSE), (@q5, '50000', FALSE), (@q5, '44000', FALSE),
                                                                               (@q6, '99 999', FALSE), (@q6, '99 900', FALSE), (@q6, '100 010', FALSE), (@q6, '99 990', TRUE),
                                                                               (@q7, '300,000 km/s', TRUE), (@q7, '150,000 km/s', FALSE), (@q7, '500,000 km/s', FALSE), (@q7, '100,000 km/s', FALSE),
                                                                               (@q8, 'Java', TRUE), (@q8, 'HTML', FALSE), (@q8, 'CSS', FALSE), (@q8, 'Photoshop', FALSE),
                                                                               (@q9, 'Mặt Trời', TRUE), (@q9, 'Mặt Trăng', FALSE), (@q9, 'Sao Hỏa', FALSE), (@q9, 'Sao Kim', FALSE),
                                                                               (@q10, 'Trung Quốc', TRUE), (@q10, 'Ấn Độ', FALSE), (@q10, 'Mỹ', FALSE), (@q10, 'Indonesia', FALSE);

-- Exercise 3 (Multiple Choice)
INSERT INTO exercises (exercise_type, grade, user_id, title) VALUES (1, '2', 3, 'Math Calculations Quiz');
SET @exercise_id = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Kết quả của phép tính 5 487 + 3 160 là');
SET @q1 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Số bị trừ là 4 201, hiệu là 1 278. Vậy số trừ là');
SET @q2 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Giá trị của biểu thức 5 412 + 3 412 – 1 980 là:');
SET @q3 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Trong các phép tính dưới đây, phép tính có kết quả nhỏ nhất là:');
SET @q4 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Nước nào có diện tích lớn nhất thế giới?');
SET @q5 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Hệ điều hành nào được sử dụng phổ biến trên điện thoại?');
SET @q6 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Tốc độ ánh sáng xấp xỉ bao nhiêu km/s?');
SET @q7 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Đâu là một ngôn ngữ lập trình?');
SET @q8 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Trái Đất quay quanh gì?');
SET @q9 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Nước nào có dân số đông nhất thế giới?');
SET @q10 = LAST_INSERT_ID();
INSERT INTO multiple_choice_answers (question_id, answer_text, is_correct) VALUES
                                                                               (@q1, '8 547', FALSE), (@q1, '8 747', FALSE), (@q1, '8 647', TRUE), (@q1, '8 474', FALSE),
                                                                               (@q2, '2 824', FALSE), (@q2, '2 923', TRUE), (@q2, '3 033', FALSE), (@q2, '3 923', FALSE),
                                                                               (@q3, '6 844', TRUE), (@q3, '7 944', FALSE), (@q3, '6 944', FALSE), (@q3, '7 844', FALSE),
                                                                               (@q4, '2 054 + 3 452', TRUE), (@q4, '987 + 6 027', FALSE), (@q4, '9 712 – 5 012', FALSE), (@q4, '6 487 – 934', FALSE),
                                                                               (@q5, 'Nga', TRUE), (@q5, 'Mỹ', FALSE), (@q5, 'Trung Quốc', FALSE), (@q5, 'Ấn Độ', FALSE),
                                                                               (@q6, 'Windows', FALSE), (@q6, 'Linux', FALSE), (@q6, 'Android', TRUE), (@q6, 'MacOS', FALSE),
                                                                               (@q7, '300,000 km/s', TRUE), (@q7, '150,000 km/s', FALSE), (@q7, '500,000 km/s', FALSE), (@q7, '100,000 km/s', FALSE),
                                                                               (@q8, 'Java', TRUE), (@q8, 'HTML', FALSE), (@q8, 'CSS', FALSE), (@q8, 'Photoshop', FALSE),
                                                                               (@q9, 'Mặt Trời', TRUE), (@q9, 'Mặt Trăng', FALSE), (@q9, 'Sao Hỏa', FALSE), (@q9, 'Sao Kim', FALSE),
                                                                               (@q10, 'Trung Quốc', TRUE), (@q10, 'Ấn Độ', FALSE), (@q10, 'Mỹ', FALSE), (@q10, 'Indonesia', FALSE);

-- Exercise 4 (Multiple Choice)
INSERT INTO exercises (exercise_type, grade, user_id, title) VALUES (1, '1', 3, 'Basic Knowledge for Grade 1');
SET @exercise_id = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Lá cờ Việt Nam có màu gì?');
SET @q1 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Con vật nào có lợi?');
SET @q2 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Giải toán có lời văn theo mấy bước?');
SET @q3 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Cần làm gì để bảo vệ răng?');
SET @q4 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Vẽ đoạn thẳng có độ dài cho trước theo mấy bước?');
SET @q5 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Khi đi bộ em cần đi như thế nào là đúng?');
SET @q6 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Lớp 1 được học bao nhiêu chữ số?');
SET @q7 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Răng trẻ em gọi là răng?');
SET @q8 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Tiếng có mấy phần?');
SET @q9 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'khi đi học em cần ăn mặc như thế nào?');
SET @q10 = LAST_INSERT_ID();
INSERT INTO multiple_choice_answers (question_id, answer_text, is_correct) VALUES
                                                                               (@q1, 'xanh', FALSE), (@q1, 'vàng', FALSE), (@q1, 'đỏ', TRUE), (@q1, 'tím', FALSE),
                                                                               (@q2, 'mèo', TRUE), (@q2, 'chuột', FALSE), (@q2, 'muỗi', FALSE), (@q2, 'châu chấu', FALSE),
                                                                               (@q3, '4', TRUE), (@q3, '5', FALSE), (@q3, '3', FALSE), (@q3, '2', FALSE),
                                                                               (@q4, 'Đánh răng ít nhất 2 lần mỗi ngày', TRUE), (@q4, 'Ăn kẹo trước khi đi ngủ.', FALSE), (@q4, 'Không đánh răng.', FALSE), (@q4, 'Ăn nhiều kẹo.', FALSE),
                                                                               (@q5, '3', TRUE), (@q5, '2', FALSE), (@q5, '4', FALSE), (@q5, '5', FALSE),
                                                                               (@q6, 'đi giữa lòng đường', FALSE), (@q6, 'Đi lề đường bên trái', FALSE), (@q6, 'Đi lề đường bên phải.', TRUE), (@q6, 'Đi vòng vèo', FALSE),
                                                                               (@q7, '100', TRUE), (@q7, '99', FALSE), (@q7, '50', FALSE), (@q7, '60', FALSE),
                                                                               (@q8, 'Răng sữa', TRUE), (@q8, 'Răng cửa', FALSE), (@q8, 'Răng giả', FALSE), (@q8, 'Răng khôn', FALSE),
                                                                               (@q9, 'gọn gàng, sạch sẽ', TRUE), (@q9, 'gọn gàng', FALSE), (@q9, 'sạch sẽ', FALSE), (@q9, 'Lôi thôi', FALSE),
                                                                               (@q10, '10', TRUE), (@q10, '11', FALSE), (@q10, '12', FALSE), (@q10, '13', FALSE);

-- Exercise 5 (Multiple Choice)
INSERT INTO exercises (exercise_type, grade, user_id, title) VALUES (1, '1', 3, 'Science and Health Quiz');
SET @exercise_id = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Lớp không khí bao quanh Trái Đất gọi là gì?');
SET @q1 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Các bệnh nào dưới đây liên quan đến nguồn nước ô nhiễm?');
SET @q2 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Những cơ quan nào sau đây trực tiếp tham gia vào quá trình trao dổi chất ở người?');
SET @q3 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Để duy trì sự sống, con người, động vật, thực vật cần những điều kiện gì?');
SET @q4 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Quá trình lấy thức ăn, nước uống, không khí từ môi trường xung quanh để tạo ra chất riêng cho cơ thể và thải ra những chất cặn bã ra môi trường được gọi chung là quá trình gì?');
SET @q5 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Cần phải ăn uống như thế nào để phòng tránh được bệnh suy dinh dưỡng');
SET @q6 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Việc không nên làm để thực hiện tốt vệ sinh an tồn thực phẩm là:');
SET @q7 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Theo thành phần chất dinh dưỡng có trong thức ăn người ta chia thức ăn thành mấy nhóm chính:');
SET @q8 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'Tiếng có mấy phần?');
SET @q9 = LAST_INSERT_ID();
INSERT INTO multiple_choice_questions (exercise_id, question) VALUES (@exercise_id, 'khi đi học em cần ăn mặc như thế nào?');
SET @q10 = LAST_INSERT_ID();
INSERT INTO multiple_choice_answers (question_id, answer_text, is_correct) VALUES
                                                                               (@q1, 'Thủy quyển.', FALSE), (@q1, 'Thạch quyển.', FALSE), (@q1, 'Khí quyển.', TRUE), (@q1, 'Sinh quyển', FALSE),
                                                                               (@q2, 'Tả, lị, thương hàn, tiêu chảy, bại liệt, viêm gan, mắt hột...', TRUE), (@q2, 'Viêm phổi, lao, cúm.', FALSE), (@q2, 'Các bệnh về tim mạch.', FALSE), (@q2, 'Các bệnh về da.', FALSE),
                                                                               (@q3, 'Tiêu hóa, hô hấp, bài tiết, tuần hoàn.', TRUE), (@q3, 'Tiêu hóa, hô hấp, bài tiết.', FALSE), (@q3, 'Tiêu hóa, hô hấp, tuần hoàn.', FALSE), (@q3, 'Tiêu hóa, hô hấp, bài tiết, khí quản.', FALSE),
                                                                               (@q4, 'Không khí, nước, thức ăn, ánh sáng.', TRUE), (@q4, 'Không khí, nước, thức ăn.', FALSE), (@q4, 'Không khí, nước, thức ăn, nhiệt độ.', FALSE), (@q4, 'Không khí, nước, thức ăn, ánh sáng, nhiệt độ.', FALSE),
                                                                               (@q5, 'Quá trình trao đổi chất.', TRUE), (@q5, 'Quá trình hô hấp.', FALSE), (@q5, 'Quá trình tiêu hóa.', FALSE), (@q5, 'Quá trình bài tiết.', FALSE),
                                                                               (@q6, 'Ăn đủ chất dinh dưỡng, đặc biệt ăn muối có bổ sung i ốt.', FALSE), (@q6, 'Ăn sạch, uống sạch, không ăn thức ăn ôi thiu, không ăn thức ăn bị ruồi, gián, chuột bò vào.', FALSE), (@q6, 'Ăn uống hợp lý, rèn thói quen ăn điều độ, ăn chậm nhai kỹ; năng rèn luyện, vận động, đi bộ và tập thể dục thể thao.', TRUE), (@q6, 'Ăn uống đầy đủ, đề phòng các bệnh truyền nhiễm, bệnh tiêu chảy và các bệnh đường ruột khác.', FALSE),
                                                                               (@q7, 'Dùng thực phẩm đóng hộp quá hạn, hoặc hộp bị thủng, phồng, han gỉ.', TRUE), (@q7, 'Chọn thức ăn tươi, sạch, có giá trị dinh dưỡng, không có màu sắc và mùi lạ.', FALSE), (@q7, 'Dùng nước sạch để rửa thực phẩm, dụng cụ và để nấu ăn.', FALSE), (@q7, 'Thức ăn được nấu chín; nấu xong nên ăn ngay.', FALSE),
                                                                               (@q8, '4', TRUE), (@q8, '1', FALSE), (@q8, '3', FALSE), (@q8, '2', FALSE),
                                                                               (@q9, 'gọn gàng, sạch sẽ', TRUE), (@q9, 'gọn gàng', FALSE), (@q9, 'sạch sẽ', FALSE), (@q9, 'Lôi thôi', FALSE),
                                                                               (@q10, '10', TRUE), (@q10, '11', FALSE), (@q10, '12', FALSE), (@q10, '13', FALSE);

-- Exercise 6 (Counting)
INSERT INTO exercises (exercise_type, grade, user_id, title) VALUES (2, '1', 3, 'Counting Objects');
SET @exercise_id = LAST_INSERT_ID();
INSERT INTO counting_questions (exercise_id, image_url) VALUES (@exercise_id, 'https://example.com/images/cats.png');
SET @q1 = LAST_INSERT_ID();
INSERT INTO counting_questions (exercise_id, image_url) VALUES (@exercise_id, 'https://example.com/images/bananas.png');
SET @q2 = LAST_INSERT_ID();
INSERT INTO counting_questions (exercise_id, image_url) VALUES (@exercise_id, 'https://example.com/images/cars.png');
SET @q3 = LAST_INSERT_ID();

INSERT INTO counting_answers (question_id, object_name, correct_count) VALUES
                                                                           (@q1, 'cat', 5),
                                                                           (@q2, 'banana', 6),
                                                                           (@q3, 'car', 4);

-- Exercise 7 (Counting)
INSERT INTO exercises (exercise_type, grade, user_id, title) VALUES (2, '1', 3, 'More Counting Practice');
SET @exercise_id = LAST_INSERT_ID();

SET @exercise_id = LAST_INSERT_ID();
INSERT INTO counting_questions (exercise_id, image_url) VALUES (@exercise_id, 'https://example.com/images/fish.png');
SET @q1 = LAST_INSERT_ID();
INSERT INTO counting_questions (exercise_id, image_url) VALUES (@exercise_id, 'https://example.com/images/cakes.png');
SET @q2 = LAST_INSERT_ID();
INSERT INTO counting_questions (exercise_id, image_url) VALUES (@exercise_id, 'https://example.com/images/ducks.png');
SET @q3 = LAST_INSERT_ID();

INSERT INTO counting_answers (question_id, object_name, correct_count) VALUES
                                                                           (@q1, 'fish', 7),
                                                                           (@q1, 'cake', 3),
                                                                           (@q1, 'duck', 8);

-- Exercise 8 (Color)
INSERT INTO exercises (exercise_type, grade, user_id, title) VALUES (3, '1', 3, 'Color Identification');
SET @exercise_id = LAST_INSERT_ID();
INSERT INTO color_questions (exercise_id, image_url) VALUES (@exercise_id, 'https://example.com/images/colors1_q1.png');
SET @q1 = LAST_INSERT_ID();
INSERT INTO color_questions (exercise_id, image_url) VALUES(@exercise_id, 'https://example.com/images/colors1_q2.png');
SET @q2 = LAST_INSERT_ID();
INSERT INTO color_questions (exercise_id, image_url) VALUES(@exercise_id, 'https://example.com/images/colors1_q3.png');
SET @q3 = LAST_INSERT_ID();

INSERT INTO color_answers (question_id, correct_position) VALUES
                                                              (@q1, 2),
                                                              (@q2, 5),
                                                              (@q3, 7);

-- Exercise 9 (Color)
INSERT INTO exercises (exercise_type, grade, user_id, title) VALUES (3, '1', 3, 'Advanced Color Identification');
SET @exercise_id = LAST_INSERT_ID();
INSERT INTO color_questions (exercise_id, image_url) VALUES (@exercise_id, 'https://example.com/images/colors2_q1.png');
SET @q1 = LAST_INSERT_ID();
INSERT INTO color_questions (exercise_id, image_url) VALUES(@exercise_id, 'https://example.com/images/colors2_q2.png');
SET @q2 = LAST_INSERT_ID();
INSERT INTO color_questions (exercise_id, image_url) VALUES(@exercise_id, 'https://example.com/images/colors2_q3.png');
SET @q3 = LAST_INSERT_ID();

INSERT INTO color_answers (question_id, correct_position) VALUES
                                                              (@q1, 3),
                                                              (@q2, 4),
                                                              (@q3, 9);

