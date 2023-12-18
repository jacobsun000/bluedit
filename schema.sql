CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(32) UNIQUE NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `email` VARCHAR(32) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `image` VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

CREATE TABLE `posts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `userid` INT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `body` TEXT NOT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `likes` INT UNSIGNED DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userid`) REFERENCES `users`(`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

# Fake data
INSERT INTO `users` (username, name, email, password, image)
VALUES
('admin', 'admin', 'adminadmin', 'admin@bluedit.com', 'https://t4.ftcdn.net/jpg/04/75/00/99/360_F_475009987_zwsk4c77x3cTpcI3W1C1LU4pOSyPKaqi.jpg');

INSERT INTO `posts` (userid, title, body) 
VALUES
(1, 'Exploring the Outdoors', 'Just had a fantastic hiking experience in the Rockies. The views were breathtaking!'),
(1, 'Favorite Recipes', 'I want to share some of my favorite vegan recipes that are both healthy and delicious.'),
(1, 'Photography Tips', 'Photography has been my passion for years. Here are some tips for beginners.'),
(1, 'Travel Diary', 'My recent trip to Japan was incredible. The culture, the food, the places... I will share it all here.'),
(1, 'Book Review', 'Just finished reading a fantastic novel. Here are my thoughts and why you should read it.'),
(1, 'DIY Home Decor', "I've been redecorating my room and learned some great DIY tricks. Stay tuned for my journey."),
(1, 'Fitness Journey', 'Documenting my fitness journey. I hope to inspire others to start their own.'),
(1, 'Gardening Tips', 'Gardening has become my new hobby. Here are some tips for growing your own vegetables.'),
(1, 'Movie Night Suggestions', 'Looking for movie suggestions? Here are my top picks for a fun movie night.'),
(1, 'Tech Reviews', "I'll be reviewing the latest tech gadgets. Stay tuned for honest and detailed reviews.");
