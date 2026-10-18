CREATE DATABASE tickethub;
USE tickethub;
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);
CREATE TABLE Events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATETIME NOT NULL,
    venue_name VARCHAR(255) NOT NULL
);
CREATE TABLE Seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    row_label CHAR(1) NOT NULL,
    seat_number INT NOT NULL,
    status ENUM('available', 'reserved', 'sold') DEFAULT 'available',
    reserved_by_user_id INT NULL,
    reserved_until DATETIME NULL,
    FOREIGN KEY (event_id) REFERENCES Events(id),
    FOREIGN KEY (reserved_by_user_id) REFERENCES Users(id),
    INDEX idx_event_status (event_id, status) -- Crucial for fast seat map loading
);
CREATE TABLE Orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (event_id) REFERENCES Events(id)
);