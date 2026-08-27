# EMPLOYEE LEAVE MANAGEMENT SYSTEM (ELMS)
## Comprehensive Project Implementation Report
**Document Version:** 1.0  
**Date:** 27/08/2026  
**System Reference:** Aligned with SRS v1.0  
**Technology Stack:** React 18 (Vite), Java 21, Spring Boot 3.4.1, PostgreSQL (Supabase), Docker, Render, Vercel  

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [System Architecture & Design](#2-system-architecture--design)
   - [2.1 High-Level 3-Tier Architecture](#21-high-level-3-tier-architecture)
   - [2.2 Layered Architecture & Design Patterns](#22-layered-architecture--design-patterns)
   - [2.3 Relational Database Schema](#23-relational-database-schema)
3. [Implementation Details by Functional Module](#3-implementation-details-by-functional-module)
   - [3.1 User Management & Authentication (FR-01)](#31-user-management--authentication-fr-01)
   - [3.2 Leave Application Management (FR-02)](#32-leave-application-management-fr-02)
   - [3.3 Leave Balance Management & Auto-Deduction (FR-03)](#33-leave-balance-management--auto-deduction-fr-03)
   - [3.4 Manager Approval & Rejection Workflow (FR-04)](#34-manager-approval--rejection-workflow-fr-04)
   - [3.5 Status Tracking & Leave Cancellation (FR-05)](#35-status-tracking--leave-cancellation-fr-05)
   - [3.6 Team Balances & Department Calendar (FR-06 / FR-07)](#36-team-balances--department-calendar-fr-06--fr-07)
4. [REST API Specification](#4-rest-api-specification)
5. [Cloud Deployment Architecture](#5-cloud-deployment-architecture)
6. [Traceability Matrix (SRS vs. Implementation)](#6-traceability-matrix-srs-vs-implementation)
7. [Testing & Quality Assurance Summary](#7-testing--quality-assurance-summary)
8. [Conclusion & Future Enhancements](#8-conclusion--future-enhancements)

---

## 1. Executive Summary

The **Employee Leave Management System (ELMS)** is a full-stack, enterprise-grade web application developed to automate, streamline, and centralize organizational leave administration. Prior manual or fragmented leave management processes frequently suffer from calculation errors, delayed approvals, untracked balances, and poor visibility. 

ELMS solves these challenges by providing:
- A responsive, role-based user interface for employees and managers.
- Real-time leave quota tracking across multiple leave categories (Annual, Sick, Casual).
- Automated leave duration calculation and validation against remaining allowances.
- A centralized approval queue with transactional balance deduction upon manager sign-off.
- Self-service leave cancellation for pending submissions.
- Multi-cloud production deployment with high availability and automated CI/CD.

---

## 2. System Architecture & Design

### 2.1 High-Level 3-Tier Architecture

The system strictly adheres to the 3-Tier architectural model specified in SRS Section 3.7:

```text
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION TIER                        │
│   React 18 (Vite) + Lucide Icons + Responsive UI Tokens     │
│   Hosted globally on Vercel Edge Network                    │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON REST API
┌──────────────────────────────▼──────────────────────────────┐
│                    APPLICATION LOGIC TIER                   │
│   Spring Boot 3.4.1 (Java 21) REST Web Services             │
│   • Controllers (Routing & DTO Request Validation)          │
│   • Services (Transactional Business Rules & Workflows)     │
│   • Repositories (Spring Data JPA / Hibernate ORM)          │
│   Containerized via Docker on Render Cloud Services         │
└──────────────────────────────┬──────────────────────────────┘
                               │ JDBC / SSL Pooler (Port 6543)
┌──────────────────────────────▼──────────────────────────────┐
│                       DATA TIER                             │
│   PostgreSQL 17.6 Relational Database Engine                │
│   Hosted on Supabase Cloud Infrastructure                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Layered Architecture & Design Patterns

1. **Controller Layer (`com.company.elms.controller`)**:
   - Manages incoming HTTP requests, extracts parameters/headers, and maps DTOs.
   - Configured with non-restrictive CORS policies for cross-origin cloud communication.
2. **Service Layer (`com.company.elms.service`)**:
   - Contains all core business logic (date validation, quota checks, status transitions).
   - Utilizes `@Transactional` to guarantee atomic database updates during review actions.
3. **Repository Layer (`com.company.elms.repository`)**:
   - Extends Spring Data `JpaRepository` with explicit JPQL queries for optimal SQL performance.
4. **Design Patterns Utilized**:
   - **MVC (Model-View-Controller)**: Strict separation between JSON data models, business logic controllers, and React UI views.
   - **Singleton Pattern**: Spring Bean lifecycle management for service and repository singletons.
   - **Builder Pattern (Lombok `@Builder`)**: Clean construction of complex JPA entity objects.
   - **DTO (Data Transfer Object) Pattern**: Decoupling API payloads (`LeaveRequestDto`, `ReviewRequestDto`, `LoginRequest`) from underlying database entities.

### 2.3 Relational Database Schema

```sql
-- 1. Users Table
CREATE TABLE users (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'EMPLOYEE', 'MANAGER'
    department VARCHAR(255),
    manager VARCHAR(255),
    avatar VARCHAR(10)
);

-- 2. Leave Balances Table
CREATE TABLE leave_balances (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL, -- 'ANNUAL', 'SICK', 'CASUAL'
    total INT NOT NULL,
    used INT NOT NULL,
    remaining INT NOT NULL
);

-- 3. Leave Applications Table
CREATE TABLE leave_applications (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    leave_code VARCHAR(50), -- e.g. 'LV-0001'
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
    reviewer_comments TEXT
);
```

---

## 3. Implementation Details by Functional Module

### 3.1 User Management & Authentication (FR-01)
- **Endpoint**: `POST /api/auth/login`
- **Mechanism**: Validates credentials against the PostgreSQL `users` table.
- **Session Persistence**: Stores the authenticated user profile in browser `localStorage` under `elms_current_user`.
- **Role Isolation**:
  - `EMPLOYEE`: Access to Dashboard, Apply for Leave, My Leaves, and Profile.
  - `MANAGER`: Access to Manager Dashboard, Pending Approvals, All Leaves History, Team Balances, and Leave Calendar.

### 3.2 Leave Application Management (FR-02)
- **Endpoint**: `POST /api/leaves`
- **Validation Rules**:
  1. `startDate` must not be chronologically after `endDate`.
  2. `daysCount` is auto-calculated using client-side JavaScript date math and verified server-side.
  3. `daysCount` must not exceed the employee's `remaining` quota for the selected leave type.
- **Record Generation**: Assigns an auto-incremented database `id` and a unique alphanumeric identifier (`LV-XXXX`).

### 3.3 Leave Balance Management & Auto-Deduction (FR-03)
- **Endpoints**: `GET /api/users/{id}/balances`, `GET /api/users/all-balances`
- **Leave Types Tracked**:
  - **Annual Leave**: Default 18 days total.
  - **Sick Leave**: Default 10 days total.
  - **Casual Leave**: Default 7 days total.
- **Automated Deduction Engine**:
  ```java
  if ("APPROVED".equalsIgnoreCase(status)) {
      LeaveBalance balance = leaveBalanceRepository.findByUserIdAndLeaveType(app.getUser().getId(), app.getLeaveType())
              .orElseThrow(() -> new RuntimeException("Leave balance record not found."));

      balance.setUsed(balance.getUsed() + app.getDaysCount());
      balance.setRemaining(Math.max(0, balance.getTotal() - balance.getUsed()));
      leaveBalanceRepository.save(balance);
  }
  ```

### 3.4 Manager Approval & Rejection Workflow (FR-04)
- **Endpoint**: `PUT /api/leaves/{id}/review`
- **Functionality**:
  - Manager inspects pending requests filtered by department.
  - Submits action (`APPROVED` or `REJECTED`) with mandatory or optional reviewer remarks.
  - Updates `reviewedBy` and `reviewedOn` audit timestamps.

### 3.5 Status Tracking & Leave Cancellation (FR-05)
- **Endpoint**: `PUT /api/leaves/{id}/cancel`
- **Functionality**:
  - Employees can track application status in real-time (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`).
  - Active `PENDING` requests present an interactive **Cancel Request** option.
  - Cancelling transitions the record to `CANCELLED` status without deducting quota.

### 3.6 Team Balances & Department Calendar (FR-06 / FR-07)
- **Team Balances View**: Summarizes remaining and utilized quotas across all department personnel.
- **Interactive Calendar**: Visualizes approved and pending leave spans on a monthly grid for proactive schedule conflict detection.

---

## 4. REST API Specification

| HTTP Method | Endpoint | Query / Path Parameters | Request Body | Success Response | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | None | `{ "email": "...", "password": "..." }` | `User` JSON object | `200 OK` |
| `GET` | `/api/users` | None | None | `List<User>` | `200 OK` |
| `GET` | `/api/users/{id}/balances` | `id` (User ID) | None | `{ "ANNUAL": {...}, "SICK": {...}, "CASUAL": {...} }` | `200 OK` |
| `GET` | `/api/users/all-balances` | None | None | `{ userId: { leaveType: balanceInfo } }` | `200 OK` |
| `GET` | `/api/leaves` | `userId`, `role` | None | `List<LeaveApplication>` | `200 OK` |
| `POST` | `/api/leaves` | `queryUserId` | `{ "leaveType": "...", "startDate": "...", "endDate": "...", "daysCount": N, "reason": "..." }` | `LeaveApplication` JSON | `200 OK` |
| `PUT` | `/api/leaves/{id}/review` | `id`, `queryReviewerName` | `{ "status": "APPROVED", "reviewerComments": "..." }` | Updated `LeaveApplication` | `200 OK` |
| `PUT` | `/api/leaves/{id}/cancel` | `id`, `queryUserId` | None | Cancelled `LeaveApplication` | `200 OK` |

---

## 5. Cloud Deployment Architecture

The live production deployment is distributed across three cloud platforms:

1. **Frontend Tier (Vercel)**:
   - Deployed at: [https://employee-leave-managament.vercel.app](https://employee-leave-managament.vercel.app)
   - Continuous deployment directly connected to GitHub repository `main` branch.
   - Built using Vite with environment variable `VITE_API_URL` pointing to backend REST API.
2. **Backend Tier (Render)**:
   - Deployed at: [https://employee-leave-managament.onrender.com](https://employee-leave-managament.onrender.com)
   - Built from a multi-stage `Dockerfile` (`maven:3.9-eclipse-temurin-21` -> `eclipse-temurin:21-jre`).
   - Configured with connection pooling constraints (`maximum-pool-size=5`) to ensure database stability.
3. **Database Tier (Supabase)**:
   - PostgreSQL 17.6 managed instance running in Asia-Pacific region.
   - Accessed over secure SSL JDBC connection pooler on port `6543`.

---

## 6. Traceability Matrix (SRS vs. Implementation)

| SRS Section | SRS Requirement Description | Project Implementation Component | Status |
| :--- | :--- | :--- | :---: |
| **3.1.1** | User Management & Role Authentication | `AuthController.java`, `UserService.java`, `LoginPage.jsx` | ✅ **100% Complete** |
| **3.1.2** | Leave Application Submission & Storage | `LeaveController.java`, `ApplyLeaveModal.jsx`, `leave_applications` table | ✅ **100% Complete** |
| **3.1.3** | Leave Balance Tracking & Quota Display | `LeaveBalance.java`, `EmployeeDashboard.jsx`, auto-deduction logic | ✅ **100% Complete** |
| **3.1.4** | Manager Review, Approval, and Rejection | `ManagerApprovals.jsx`, `LeaveService.reviewApplication()` | ✅ **100% Complete** |
| **3.1.5** | Leave Status Tracking & Updates | `LeaveHistoryTable.jsx`, `StatusBadge.jsx`, `cancelLeave()` method | ✅ **100% Complete** |
| **3.2** | Usability & Consistent Navigation | Responsive Sidebar, Toast notifications, semantic typography | ✅ **100% Complete** |
| **3.3** | Reliability & Input Validation | Client & server date validation, transactional integrity (`@Transactional`) | ✅ **100% Complete** |
| **3.4** | System Performance & Response Time | JPA indexing, lazy-loading serialization optimization, cloud CDN | ✅ **100% Complete** |
| **3.5** | Security & Access Control | Encapsulated DB credentials via environment variables, role-based views | ✅ **100% Complete** |
| **3.7** | Design Constraints (Spring Boot, MVC) | Spring Boot 3, MVC pattern, Layered Architecture, Postman collection | ✅ **100% Complete** |
| **3.10** | Interfaces & API Communications | REST API over HTTPS, JSON payload standards, Docker deployment | ✅ **100% Complete** |

---

## 7. Testing & Quality Assurance Summary

The application has been verified against the formal test suite documented in [ELMS_Test_Cases.md](file:///ELMS_Test_Cases.md):

| Module | Test Cases Executed | Pass | Fail | Pass Rate |
| :--- | :---: | :---: | :---: | :---: |
| **1. Authentication (FR-01)** | 4 | 4 | 0 | 100% |
| **2. Leave Balances (FR-02)** | 3 | 3 | 0 | 100% |
| **3. Apply for Leave (FR-03)** | 4 | 4 | 0 | 100% |
| **4. View Leave History (FR-04)** | 2 | 2 | 0 | 100% |
| **5. Manager Approvals & Auto-Deduction (FR-05)** | 4 | 4 | 0 | 100% |
| **6. Team Balances (FR-06)** | 1 | 1 | 0 | 100% |
| **7. Leave Calendar (FR-07)** | 1 | 1 | 0 | 100% |
| **8. Profile Page (FR-08)** | 1 | 1 | 0 | 100% |
| **9. REST API Postman Integration** | 4 | 4 | 0 | 100% |
| **Total** | **24** | **24** | **0** | **100%** |

---

## 8. Conclusion & Future Enhancements

The **Employee Leave Management System (ELMS)** has been designed, developed, tested, and deployed in full compliance with the requirements and constraints outlined in **SRS v1.0**. The system demonstrates robust full-stack architecture, clean separation of concerns, atomic transactional state management, and reliable cloud hosting.

### Potential Future Enhancements
1. **Email / Slack Notifications**: Automated dispatch of webhook notifications upon application submission and review.
2. **Document Attachments**: Support for medical certificate uploads for sick leaves exceeding 2 consecutive days.
3. **Year-End Carryover Engine**: Automated cron service to calculate and roll over unused annual leave quotas at the conclusion of each fiscal year.
