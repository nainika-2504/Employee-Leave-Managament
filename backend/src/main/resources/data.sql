-- =========================================================================
-- EMPLOYEE LEAVE MANAGEMENT SYSTEM (ELMS)
-- Seed Data Script (MySQL) - SRS v1.0
-- =========================================================================

USE elms_db;

-- 1. Seed Users
INSERT INTO users (id, name, email, password, role, department, manager, avatar) VALUES
(1, 'Nainika', 'nainika@company.com', 'password', 'EMPLOYEE', 'Engineering', 'Apoorva', 'NA'),
(2, 'Apoorva', 'apoorva@company.com', 'password', 'MANAGER', 'Engineering Management', NULL, 'AP'),
(3, 'Natasha', 'natasha@company.com', 'password', 'EMPLOYEE', 'Engineering', 'Apoorva', 'NT'),
(4, 'Sarvani', 'sarvani@company.com', 'password', 'EMPLOYEE', 'Design', 'Apoorva', 'SV'),
(5, 'Sahaja', 'sahaja@company.com', 'password', 'EMPLOYEE', 'Engineering', 'Apoorva', 'SH')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Seed Leave Balances
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

-- 3. Seed Initial Leave Applications
INSERT INTO leave_applications (id, user_id, user_name, department, leave_type, leave_type_name, start_date, end_date, days_count, reason, status, applied_on, reviewed_by, reviewed_on, reviewer_comments) VALUES
('LV-1001', 1, 'Nainika', 'Engineering', 'ANNUAL', 'Annual Leave', '2026-09-10', '2026-09-12', 3, 'Family vacation trip', 'PENDING', '2026-08-24', NULL, NULL, ''),
('LV-1002', 3, 'Natasha', 'Engineering', 'CASUAL', 'Casual Leave', '2026-09-01', '2026-09-02', 2, 'Attending cousin''s wedding', 'PENDING', '2026-08-25', NULL, NULL, ''),
('LV-1000', 1, 'Nainika', 'Engineering', 'SICK', 'Sick Leave', '2026-08-15', '2026-08-15', 1, 'Dental surgery procedure and recovery', 'APPROVED', '2026-08-14', 'Apoorva', '2026-08-14', 'Approved. Get well soon!'),
('LV-0999', 4, 'Sarvani', 'Design', 'ANNUAL', 'Annual Leave', '2026-08-01', '2026-08-05', 5, 'Personal travel', 'REJECTED', '2026-07-28', 'Apoorva', '2026-07-29', 'Conflict with major product release deadline.')
ON DUPLICATE KEY UPDATE status=VALUES(status);
