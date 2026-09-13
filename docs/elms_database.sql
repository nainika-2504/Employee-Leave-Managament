-- =========================================================================
-- EMPLOYEE LEAVE MANAGEMENT SYSTEM (ELMS)
-- Complete Database Script (MySQL) - Aligned with SRS v1.0 (Group-3)
-- =========================================================================

-- Create and select Database
CREATE DATABASE IF NOT EXISTS elms_db;
USE elms_db;

-- -------------------------------------------------------------------------
-- 1. Table Structure: users
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS leave_applications;
DROP TABLE IF EXISTS leave_balances;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'EMPLOYEE' or 'MANAGER'
    department VARCHAR(255),
    manager VARCHAR(255),
    avatar VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------------
-- 2. Table Structure: leave_balances
-- -------------------------------------------------------------------------
CREATE TABLE leave_balances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    leave_type VARCHAR(50) NOT NULL, -- 'ANNUAL', 'SICK', 'CASUAL'
    total INT NOT NULL,
    used INT NOT NULL,
    remaining INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------------
-- 3. Table Structure: leave_applications
-- -------------------------------------------------------------------------
CREATE TABLE leave_applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    leave_code VARCHAR(50), -- e.g. 'LV-1001'
    user_id BIGINT NOT NULL,
    user_name VARCHAR(255),
    department VARCHAR(255),
    leave_type VARCHAR(50) NOT NULL,
    leave_type_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'
    applied_on DATE NOT NULL,
    reviewed_by VARCHAR(255),
    reviewed_on DATE,
    reviewer_comments TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
-- INITIAL SEED DATA (Demo Users, Statutory Quotas & Leave History)
-- =========================================================================

-- Seed Team Users
INSERT INTO users (id, name, email, password, role, department, manager, avatar) VALUES
(1, 'Nainika', 'nainika@company.com', 'password', 'EMPLOYEE', 'Engineering', 'Apoorva', 'NA'),
(2, 'Apoorva', 'apoorva@company.com', 'password', 'MANAGER', 'Engineering Management', NULL, 'AP'),
(3, 'Natasha', 'natasha@company.com', 'password', 'EMPLOYEE', 'Engineering', 'Apoorva', 'NT'),
(4, 'Sarvani', 'sarvani@company.com', 'password', 'EMPLOYEE', 'Design', 'Apoorva', 'SV'),
(5, 'Sahaja', 'sahaja@company.com', 'password', 'EMPLOYEE', 'Engineering', 'Apoorva', 'SH');

-- Seed Leave Balances (Statutory Quotas: 18 Annual, 10 Sick, 7 Casual)
INSERT INTO leave_balances (user_id, leave_type, total, used, remaining) VALUES
(1, 'ANNUAL', 18, 4, 14),
(1, 'SICK', 10, 1, 9),
(1, 'CASUAL', 7, 2, 5),
(3, 'ANNUAL', 18, 6, 12),
(3, 'SICK', 10, 0, 10),
(3, 'CASUAL', 7, 3, 4),
(4, 'ANNUAL', 18, 10, 8),
(4, 'SICK', 10, 2, 8),
(4, 'CASUAL', 7, 1, 6),
(5, 'ANNUAL', 18, 2, 16),
(5, 'SICK', 10, 3, 7),
(5, 'CASUAL', 7, 0, 7);

-- Seed Historical Leave Applications
INSERT INTO leave_applications (leave_code, user_id, user_name, department, leave_type, leave_type_name, start_date, end_date, days_count, reason, status, applied_on, reviewed_by, reviewed_on, reviewer_comments) VALUES
('LV-1001', 1, 'Nainika', 'Engineering', 'ANNUAL', 'Annual Leave', '2026-09-10', '2026-09-12', 3, 'Family vacation trip', 'PENDING', '2026-08-24', NULL, NULL, ''),
('LV-1002', 3, 'Natasha', 'Engineering', 'CASUAL', 'Casual Leave', '2026-09-01', '2026-09-02', 2, 'Attending cousin''s wedding', 'PENDING', '2026-08-25', NULL, NULL, ''),
('LV-1000', 1, 'Nainika', 'Engineering', 'SICK', 'Sick Leave', '2026-08-15', '2026-08-15', 1, 'Dental surgery procedure and recovery', 'APPROVED', '2026-08-14', 'Apoorva', '2026-08-14', 'Approved. Get well soon!'),
('LV-0999', 4, 'Sarvani', 'Design', 'ANNUAL', 'Annual Leave', '2026-08-01', '2026-08-05', 5, 'Personal travel', 'REJECTED', '2026-07-28', 'Apoorva', '2026-07-29', 'Conflict with major product release deadline.');
