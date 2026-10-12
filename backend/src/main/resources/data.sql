-- =========================================================================
-- EMPLOYEE LEAVE MANAGEMENT SYSTEM (ELMS)
-- Seed Data Script (MySQL) - SRS v1.0
-- =========================================================================

USE elms_db;

-- 1. Seed Users
INSERT INTO users (id, name, email, password, role, department, manager, avatar, joining_date) VALUES
(1, 'Nainika', 'nainika@company.com', 'password', 'EMPLOYEE', 'Engineering', 'Apoorva', 'NA', '2024-01-15'),
(2, 'Apoorva', 'apoorva@company.com', 'password', 'MANAGER', 'Engineering Management', NULL, 'AP', '2023-06-01'),
(3, 'Natasha', 'natasha@company.com', 'password', 'EMPLOYEE', 'Engineering', 'Apoorva', 'NT', '2024-03-10'),
(4, 'Sarvani', 'sarvani@company.com', 'password', 'EMPLOYEE', 'Design', 'Apoorva', 'SV', '2024-05-20'),
(5, 'Sahaja', 'sahaja@company.com', 'password', 'EMPLOYEE', 'Engineering', 'Apoorva', 'SH', '2024-08-01')
ON DUPLICATE KEY UPDATE name=VALUES(name), joining_date=VALUES(joining_date);

-- 2. Seed Leave Balances (10 days accumulated to date as of October)
INSERT INTO leave_balances (user_id, leave_type, total, used, remaining) VALUES
(1, 'NORMAL', 10, 2, 8),
(1, 'MEDICAL', 10, 1, 9),
(1, 'EXTENDED', 30, 0, 30),
(3, 'NORMAL', 10, 4, 6),
(3, 'MEDICAL', 10, 0, 10),
(3, 'EXTENDED', 30, 0, 30),
(4, 'NORMAL', 10, 3, 7),
(4, 'MEDICAL', 10, 2, 8),
(4, 'EXTENDED', 30, 0, 30),
(5, 'NORMAL', 10, 1, 9),
(5, 'MEDICAL', 10, 3, 7),
(5, 'EXTENDED', 30, 0, 30)
ON DUPLICATE KEY UPDATE total=VALUES(total), remaining=VALUES(remaining);

-- 3. Seed Initial Leave Applications
INSERT INTO leave_applications (id, user_id, user_name, department, leave_type, leave_type_name, start_date, end_date, days_count, reason, status, applied_on, reviewed_by, reviewed_on, reviewer_comments) VALUES
('LV-1001', 1, 'Nainika', 'Engineering', 'NORMAL', 'Normal Leave', '2026-09-10', '2026-09-12', 3, 'Family vacation trip', 'PENDING', '2026-08-24', NULL, NULL, ''),
('LV-1002', 3, 'Natasha', 'Engineering', 'NORMAL', 'Normal Leave', '2026-09-01', '2026-09-02', 2, 'Attending cousin''s wedding', 'PENDING', '2026-08-25', NULL, NULL, ''),
('LV-1000', 1, 'Nainika', 'Engineering', 'MEDICAL', 'Medical Leave', '2026-08-15', '2026-08-15', 1, 'Dental surgery procedure and recovery', 'APPROVED', '2026-08-14', 'Apoorva', '2026-08-14', 'Approved. Get well soon!'),
('LV-0999', 4, 'Sarvani', 'Design', 'EXTENDED', 'Extended Leave', '2026-08-01', '2026-08-05', 5, 'Personal travel abroad', 'REJECTED', '2026-07-28', 'Apoorva', '2026-07-29', 'Conflict with major product release deadline.')
ON DUPLICATE KEY UPDATE status=VALUES(status);
