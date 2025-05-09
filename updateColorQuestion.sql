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
-- Table structure for table `color_questions`
--
use btl_mad;
DROP TABLE IF EXISTS `color_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `color_questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exercise_id` int NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `public_id` varchar(255) DEFAULT NULL,
  `question_text` varchar(255) DEFAULT 'Ảnh có 9 ô, hãy điền vào kết quả vị trí ô khác màu',
  PRIMARY KEY (`id`),
  KEY `exercise_id` (`exercise_id`),
  CONSTRAINT `color_questions_ibfk_1` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `color_questions`
--

LOCK TABLES `color_questions` WRITE;
/*!40000 ALTER TABLE `color_questions` DISABLE KEYS */;
INSERT INTO `color_questions` VALUES (1,8,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745853872/grid_image_fifth_10-key1_dmunkm.png',NULL,'Ảnh có 9 ô, hãy điền vào kết quả vị trí ô khác màu'),(2,8,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745853871/grid_image_fifth_9-key5_ebv9tw.png',NULL,'Ảnh có 9 ô, hãy điền vào kết quả vị trí ô khác màu'),(3,8,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745853870/grid_image_fifth_8-key8_o5xms8.png',NULL,'Ảnh có 9 ô, hãy điền vào kết quả vị trí ô khác màu'),(4,8,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745853869/grid_image_fifth_7-key6_hf5n9i.png',NULL,'Ảnh có 9 ô, hãy điền vào kết quả vị trí ô khác màu'),(5,8,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745853868/grid_image_fifth_6-key6_u6kvgu.png',NULL,'Ảnh có 9 ô, hãy điền vào kết quả vị trí ô khác màu'),(6,8,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745853867/grid_image_fifth_5-key6_ooijlx.png',NULL,'Ảnh có 9 ô, hãy điền vào kết quả vị trí ô khác màu'),(7,8,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745853866/grid_image_fifth_4-key6_ye8wbl.png',NULL,'Ảnh có 9 ô, hãy điền vào kết quả vị trí ô khác màu'),(8,8,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745853865/grid_image_fifth_3-key1_zwtgpg.png',NULL,'Ảnh có 9 ô, hãy điền vào kết quả vị trí ô khác màu'),(9,8,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745853864/grid_image_fifth_2-key7_ffgbbd.png',NULL,'Ảnh có 9 ô, hãy điền vào kết quả vị trí ô khác màu'),(10,8,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745853863/grid_image_fifth_1-key8_vudgjq.png',NULL,'Ảnh có 9 ô, hãy điền vào kết quả vị trí ô khác màu'),(11,9,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745853917/grid_image_fourth_10-key7_usncgk.png',NULL,'Ảnh có 9 ô, hãy điền vào kết quả vị trí ô khác màu'),(12,9,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745853915/grid_image_fourth_9-key3_y7leor.png',NULL,'Ảnh có 9 ô, hãy điền vào kết quả vị trí ô khác màu'),(13,9,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745853914/grid_image_fourth_8-key2_z79bhm.png',NULL,'Ảnh có 9 ô, hãy điền vào kết quả vị trí ô khác màu'),(14,9,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745853913/grid_image_fourth_7-key2_bubqbm.png',NULL,'Ảnh có 9 ô, hãy điền vào kết quả vị trí ô khác màu'),(15,9,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745853912/grid_image_fourth_6-key2_lzm2we.png',NULL,'Ảnh có 9 ô, hãy điền vào kết quả vị trí ô khác màu'),(16,9,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745853911/grid_image_fourth_5-key2_oskk3o.png',NULL,'Ảnh có 9 ô, hãy điền vào kết quả vị trí ô khác màu'),(17,9,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745853910/grid_image_fourth_4-key8_tl0gfj.png',NULL,'Ảnh có 9 ô, hãy điền vào kết quả vị trí ô khác màu'),(18,9,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745853908/grid_image_fourth_3-key1_dlobrz.png',NULL,'Ảnh có 9 ô, hãy điền vào kết quả vị trí ô khác màu'),(19,9,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745853907/grid_image_fourth_2-key8_iwxexa.png',NULL,'Ảnh có 9 ô, hãy điền vào kết quả vị trí ô khác màu'),(20,9,'https://res.cloudinary.com/dy3zrracj/image/upload/v1745853906/grid_image_fourth_1-key2_jpfqm5.png',NULL,'Ảnh có 9 ô, hãy điền vào kết quả vị trí ô khác màu');
/*!40000 ALTER TABLE `color_questions` ENABLE KEYS */;
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
