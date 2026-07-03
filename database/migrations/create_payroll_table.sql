CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    attendance_date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    status ENUM('present', 'absent', 'late', 'leave') DEFAULT 'present',
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);