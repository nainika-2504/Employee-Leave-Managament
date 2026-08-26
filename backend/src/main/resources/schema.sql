-- =========================================================================
-- EMPLOYEE LEAVE MANAGEMENT SYSTEM (ELMS)
-- Database Schema Script (MySQL) - SRS v1.0
-- =========================================================================

CREATE DATABASE IF NOT EXISTS elms_db;
USE elms_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'EMPLOYEE', 'MANAGER'
    department VARCHAR(255),
    manager VARCHAR(255),
    avatar VARCHAR(10)
);

-- 2. Leave Balances Table
CREATE TABLE IF NOT EXISTS leave_balances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    leave_type VARCHAR(50) NOT NULL, -- 'ANNUAL', 'SICK', 'CASUAL'
    total INT NOT NULL,
    used INT NOT NULL,
    remaining INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Leave Applications Table
CREATE TABLE IF NOT EXISTS leave_applications (
    id VARCHAR(50) PRIMARY KEY, -- 'LV-XXXX'
    user_id BIGINT NOT NULL,
    user_name VARCHAR(255),
    department VARCHAR(255),
    leave_type VARCHAR(50) NOT NULL,
    leave_type_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'PENDING', 'APPROVED', 'REJECTED'
    applied_on DATE NOT NULL,
    reviewed_by VARCHAR(255),
    reviewed_on DATE,
    reviewer_comments TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
