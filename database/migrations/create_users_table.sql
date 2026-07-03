CREATE TABLE payroll (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    salary_month VARCHAR(20) NOT NULL,
    basic_salary DECIMAL(10, 2) NOT NULL,
    overtime_amount DECIMAL(10, 2) DEFAULT 0.00,
    deductions DECIMAL(10, 2) DEFAULT 0.00,
    net_salary DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'paid') DEFAULT 'pending',
    payment_date DATE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);