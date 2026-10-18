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

INSERT INTO Users (id, name, email, password_hash)
VALUES (1, 'Demo Booker', 'demo@example.test', 'mock-auth-only');

INSERT INTO Events (id, name, date, venue_name)
VALUES (1, 'TicketHub Demo Event', '2027-01-01 19:00:00', 'Main Hall');

INSERT INTO Seats (event_id, row_label, seat_number)
VALUES
    (1, 'A', 1), (1, 'A', 2), (1, 'A', 3), (1, 'A', 4),
    (1, 'A', 5), (1, 'A', 6), (1, 'A', 7), (1, 'A', 8),
    (1, 'B', 1), (1, 'B', 2), (1, 'B', 3), (1, 'B', 4),
    (1, 'B', 5), (1, 'B', 6), (1, 'B', 7), (1, 'B', 8);