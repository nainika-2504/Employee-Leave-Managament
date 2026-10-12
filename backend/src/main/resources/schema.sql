-- =========================================================================
-- EMPLOYEE LEAVE MANAGEMENT SYSTEM (ELMS) - COMPLETE SCHEMA DDL
-- =========================================================================

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    department VARCHAR(255),
    manager VARCHAR(255),
    avatar VARCHAR(10),
    joining_date DATE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS leave_balances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    total DOUBLE NOT NULL DEFAULT 0.0,
    used DOUBLE NOT NULL DEFAULT 0.0,
    remaining DOUBLE NOT NULL DEFAULT 0.0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS leave_applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    leave_code VARCHAR(50),
    user_id BIGINT NOT NULL,
    user_name VARCHAR(255),
    department VARCHAR(255),
    leave_type VARCHAR(50) NOT NULL,
    leave_type_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count DOUBLE NOT NULL DEFAULT 0.0,
    is_half_day TINYINT(1) DEFAULT 0,
    half_day_session VARCHAR(20),
    medical_certificate VARCHAR(500),
    documentation_status VARCHAR(50) DEFAULT 'NONE',
    retroactive TINYINT(1) DEFAULT 0,
    retrospective_reason TEXT,
    submission_date DATE,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    applied_on DATE NOT NULL,
    reviewed_by VARCHAR(255),
    reviewed_on DATE,
    reviewer_comments TEXT,
    override_reason TEXT,
    shortage_warning TINYINT(1) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS leave_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    amount DOUBLE NOT NULL,
    balance_after DOUBLE NOT NULL,
    effective_date DATE NOT NULL,
    leave_application_id BIGINT,
    performed_by VARCHAR(255) NOT NULL,
    reason TEXT,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT,
    performed_by VARCHAR(255) NOT NULL,
    details TEXT,
    timestamp DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(100) NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    link_id BIGINT,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS leave_policies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    policy_key VARCHAR(100) NOT NULL UNIQUE,
    policy_value VARCHAR(255) NOT NULL,
    description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS holidays (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    holiday_date DATE NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS manager_delegations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    delegator_id BIGINT NOT NULL,
    delegate_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    active TINYINT(1) DEFAULT 1,
    reason VARCHAR(255),
    FOREIGN KEY (delegator_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (delegate_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS monthly_accrual_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    accrual_period VARCHAR(20) NOT NULL,
    accrued_days DOUBLE NOT NULL,
    accrued_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
