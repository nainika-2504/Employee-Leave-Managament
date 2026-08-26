-- =========================================================================
-- EMPLOYEE LEAVE MANAGEMENT SYSTEM (ELMS)
-- Seed Data Script (MySQL) - SRS v1.0
-- =========================================================================

USE elms_db;

-- 1. Seed Users
INSERT INTO users (id, name, email, password, role, department, manager, avatar) VALUES
(101, 'Alex Morgan', 'alex.morgan@company.com', 'password', 'EMPLOYEE', 'Engineering', 'Sarah Jenkins', 'AM'),
(201, 'Sarah Jenkins', 'sarah.jenkins@company.com', 'password', 'MANAGER', 'Engineering Management', NULL, 'SJ'),
(102, 'David Kim', 'david.kim@company.com', 'password', 'EMPLOYEE', 'Engineering', 'Sarah Jenkins', 'DK'),
(103, 'Emma Watson', 'emma.watson@company.com', 'password', 'EMPLOYEE', 'Design', 'Sarah Jenkins', 'EW')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Seed Leave Balances
INSERT INTO leave_balances (user_id, leave_type, total, used, remaining) VALUES
(101, 'ANNUAL', 18, 4, 14),
(101, 'SICK', 10, 1, 9),
(101, 'CASUAL', 7, 2, 5),
(102, 'ANNUAL', 18, 6, 12),
(102, 'SICK', 10, 0, 10),
(102, 'CASUAL', 7, 3, 4),
(103, 'ANNUAL', 18, 10, 8),
(103, 'SICK', 10, 2, 8),
(103, 'CASUAL', 7, 1, 6);

-- 3. Seed Initial Leave Applications
INSERT INTO leave_applications (id, user_id, user_name, department, leave_type, leave_type_name, start_date, end_date, days_count, reason, status, applied_on, reviewed_by, reviewed_on, reviewer_comments) VALUES
('LV-1001', 101, 'Alex Morgan', 'Engineering', 'ANNUAL', 'Annual Leave', '2026-09-10', '2026-09-12', 3, 'Family summer vacation trip', 'PENDING', '2026-08-24', NULL, NULL, ''),
('LV-1002', 102, 'David Kim', 'Engineering', 'CASUAL', 'Casual Leave', '2026-09-01', '2026-09-02', 2, 'Attending cousin''s wedding', 'PENDING', '2026-08-25', NULL, NULL, ''),
('LV-1000', 101, 'Alex Morgan', 'Engineering', 'SICK', 'Sick Leave', '2026-08-15', '2026-08-15', 1, 'Dental surgery procedure and recovery', 'APPROVED', '2026-08-14', 'Sarah Jenkins', '2026-08-14', 'Approved. Get well soon!'),
('LV-0999', 103, 'Emma Watson', 'Design', 'ANNUAL', 'Annual Leave', '2026-08-01', '2026-08-05', 5, 'Personal travel', 'REJECTED', '2026-07-28', 'Sarah Jenkins', '2026-07-29', 'Conflict with major product release deadline.')
ON DUPLICATE KEY UPDATE status=VALUES(status);
