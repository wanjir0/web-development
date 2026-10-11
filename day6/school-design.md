# School Database Design

## Tables

- **students** stores each student's ID, name, and unique email address.
- **courses** stores each course's ID and unique name.
- **enrollments** records that a student is taking a course and stores that student's grade for the course. Its `(student_id, course_id)` primary key prevents duplicate enrollments for the same student and course.

## Relationships

One student can have many enrollments, and one course can have many enrollments; each enrolment belongs to exactly one student and one course. This models the many-to-many relationship between students and courses: many students can take many courses. The `enrollments` join table is needed to connect the two entities and to store relationship-specific data, such as the grade. Its foreign keys ensure that every enrolment refers to an existing student and course.

## Index

The `idx_enrollments_course_id` index supports lookups of all students on a course and course-based enrolment counts without scanning the entire enrollments table. The composite primary key already supports lookups starting with `student_id`.

## SQL or NoSQL?

I would choose a relational SQL database for this system. Students, courses, and enrollments have clear structured relationships, and foreign keys and uniqueness constraints help preserve data integrity. SQL joins make it easy to retrieve courses per student, students per course, and enrolment counts. A document-oriented NoSQL database could store this information, but representing the many-to-many relationship while avoiding duplicated or inconsistent student and course data would be less suitable for this small school system.
