-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: btl_mad
-- ------------------------------------------------------
-- Server version	9.0.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `counting_answers`
--
use btl_mad;
DROP TABLE IF EXISTS `counting_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `counting_answers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `object_name` varchar(255) NOT NULL,
  `correct_count` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `counting_answers_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `counting_questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `counting_answers`
--

LOCK TABLES `counting_answers` WRITE;
/*!40000 ALTER TABLE `counting_answers` DISABLE KEYS */;
INSERT INTO `counting_answers` VALUES (1,1,'diem_khac_nhau',5),(2,2,'diem_khac_biet',5),(3,3,'con_vat_khac_nhau',8),(4,4,'nong_trai_khac_nhau',5),(5,5,'tong_hoa_qua',19),(6,6,'tong_chu_cai',18),(7,7,'chon_dap_an',3),(8,8,'bong_bau_duc',39),(9,9,'bong_ro',18),(10,10,'pokemon',15),(11,11,'tam_giac',8),(12,12,'vuong',7),(13,13,'voi',5),(14,14,'tho',4),(15,15,'lightning',2),(16,16,'watermelon',6),(17,17,'vi_tri_dung',1),(18,18,'tong_con',19),(19,19,'dem_tong',24),(20,20,'cherry',4);
/*!40000 ALTER TABLE `counting_answers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-08 23:13:42
-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: btl_mad
-- ------------------------------------------------------
-- Server version	9.0.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `counting_questions`
--
use btl_mad;
DROP TABLE IF EXISTS `counting_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `counting_questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exercise_id` int NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `public_id` varchar(255) DEFAULT NULL,
  `question_text` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `exercise_id` (`exercise_id`),
  CONSTRAINT `counting_questions_ibfk_1` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `counting_questions`
--

LOCK TABLES `counting_questions` WRITE;
/*!40000 ALTER TABLE `counting_questions` DISABLE KEYS */;
INSERT INTO `counting_questions` VALUES (1,6,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745859830/dem_so_diem_khac_nhau_5_vx0a5r.jpg',NULL,'Cùng đếm số điểm khác nhau và điền kết quả nhé!'),(2,6,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745859829/so_diem_khac_nhau_5_a5xcln.jpg',NULL,'Cùng đếm số điểm khác nhau và điền kết quả nhé!'),(3,6,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745859827/so_diem_khac_nhau_8_l76eru.jpg',NULL,'Cùng đếm số điểm khác nhau và điền kết quả nhé!'),(4,6,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745859825/so_diem_khac_biet_5_pasucf.jpg',NULL,'Cùng đếm số điểm khác nhau và điền kết quả nhé!'),(5,6,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745859824/tinh_so_hoa_qua-key19_sx1jcj.jpg',NULL,'Tìm giá trị của dấu ? bằng cách tính tổng số hoa quả nào!'),(6,6,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745859822/tinh_gia_tri_chu_cai-key18_vyxozv.jpg',NULL,'Tìm giá trị của dấu ? bằng cách tính tổng các chữ số!'),(7,6,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745859821/hinh_nhin_tu_tren_xuong-key3_ipiyzu.jpg',NULL,'Tìm vị trí của tam giác đúng (lần lượt từ trái qua phải đánh số từ 1 đến 4)'),(8,6,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745859819/tinh_tong_trong_hinh-key39_lmwm6b.jpg',NULL,'Đến giờ chơi bóng rồi, hãy điền kết quả đúng cho dấu ? nhé!'),(9,6,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745859818/tinh_tong_bong_ro-key18_pzw5dl.jpg',NULL,'Ai cũng thích bóng rổ nhỉ, tính tổng phép tính nào!'),(10,6,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745859817/tinh_tong_pokemon-key15_lbfthl.jpg',NULL,'Tính tổng phép tính của các nhân vật trong Pokemon bạn nhé!'),(11,7,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745860080/dem_so_tam_giac-key8_c2qpz4.jpg',NULL,'Hãy điền kết quả đúng cho số tam giác có trong hình nào!'),(12,7,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745860078/dem_so_hinh_vuong-key7_qgunux.jpg',NULL,'Hãy điền kết quả đúng cho số hình vuông có trong hình nào!'),(13,7,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745860076/dem_so_voi-key5_rdisdn.jpg',NULL,'Đếm số các bạn voi có trong ảnh nha!'),(14,7,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745860074/dem_so_tho-key4_y6tn42.jpg',NULL,'Đố bạn biết có bao nhiêu bé thỏ trong hình!'),(15,7,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745860072/dem_so_tia_set-key2_mwzv0g.jpg',NULL,'Sắp mưa rồi, hỏi bạn có bao nhiêu tia sét trong ảnh đó!'),(16,7,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745860071/dem_so_dua_hau-key6_jvjsrw.jpg',NULL,'Bạn nào thích ăn dưa hấu, hãy tính tổng quả dưa trong hình nha!'),(17,7,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745860068/chon_hinh_dung-key1_why0pg.jpg',NULL,'Điền kết quả vị trí hình đúng nha (từ trái qua phải là từ 1 đến 4)!'),(18,7,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745860067/dem_tong_con_vat-key19_xqeogt.jpg',NULL,'Cùng thực hiện tính tổng số con vật trong hình nha!'),(19,7,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745860065/tinh_tong_con_vat-key24_xkn94m.jpg',NULL,'Hãy tính phép tính tổng để giúp bạn khỉ ăn được chuối nha!'),(20,7,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745860063/dem_so_cherry-key4_mg7ve5.jpg',NULL,'Cùng xem ảnh và đếm số cherry trong đó nào bạn!');
/*!40000 ALTER TABLE `counting_questions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-08 23:13:43
