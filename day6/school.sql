PRAGMA foreign_keys = ON;
CREATE TABLE students (
    student_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);
CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY,
    course_name TEXT NOT NULL UNIQUE
);
CREATE TABLE enrollments (
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade REAL NOT NULL CHECK (
        grade >= 0
        AND grade <= 100
    ),
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students (student_id),
    FOREIGN KEY (course_id) REFERENCES courses (course_id)
);
CREATE INDEX idx_enrollments_course_id ON enrolments (course_id);
INSERT INTO students (student_id, name, email)
VALUES (1, 'Amina Yusuf', 'amina@example.edu'),
    (2, 'Brian Otieno', 'brian@example.edu'),
    (3, 'Charlyne Wanjiru', 'chao@example.edu'),
    (4, 'Diana Njeri', 'diana@example.edu');
INSERT INTO courses (course_id, course_name)
VALUES (101, 'Database Systems'),
    (102, 'Web Development'),
    (103, 'Computer Networks');
INSERT INTO enrollments (student_id, course_id, grade)
VALUES (1, 101, 92),
    (1, 102, 88),
    (2, 101, 76),
    (2, 103, 81),
    (3, 102, 95);
-- All courses for one student, selected by the student's name.
SELECT c.course_name,
    e.grade
FROM students AS s
    JOIN enrollments AS e ON e.student_id = s.student_id
    JOIN courses AS c ON c.course_id = e.course_id
WHERE s.name = 'Amina Yusuf'
ORDER BY c.course_name;
-- All students enrolled on one course.
SELECT s.name,
    s.email,
    e.grade
FROM courses AS c
    JOIN enrollments AS e ON e.course_id = c.course_id
    JOIN students AS s ON s.student_id = e.student_id
WHERE c.course_name = 'Database Systems'
ORDER BY s.name;
-- Number of students per course, including courses with no enrolments.
SELECT c.course_name,
    COUNT(e.student_id) AS student_count
FROM courses AS c
    LEFT JOIN enrollments AS e ON e.course_id = c.course_id
GROUP BY c.course_id,
    c.course_name
ORDER BY c.course_name;
-- Students who have no enrolments.
SELECT s.name,
    s.email
FROM students AS s
    LEFT JOIN enrollments AS e ON e.student_id = s.student_id
WHERE e.student_id IS NULL
ORDER BY s.name;
-- Update Amina Yusuf's grade in Database Systems.
UPDATE enrollments
SET grade = 95
WHERE student_id = 1
    AND course_id = 101;