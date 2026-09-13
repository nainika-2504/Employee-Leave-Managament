# EMPLOYEE LEAVE MANAGEMENT SYSTEM (ELMS)
## Review Presentation & Demonstration Guide

**Project Name:** Employee Leave Management System (ELMS)  
**Document Version:** 1.0  
**Technology Stack:** React 18 (Vite) • Java 21 • Spring Boot 3.4.1 • MySQL 9.6 • Docker • Vercel • Render  
**Artifacts Provided:**
- **draw.io Architecture File:** [`ELMS_System_Architecture.drawio`](file:///c:/Users/u2388/OneDrive/Documents/Employee-Leave-Managament/ELMS_System_Architecture.drawio)
- **High-Res Architecture SVG:** [`ELMS_System_Architecture.svg`](file:///c:/Users/u2388/OneDrive/Documents/Employee-Leave-Managament/ELMS_System_Architecture.svg)
- **Postman API Test Suite:** [`ELMS_API_Collection.postman_collection.json`](file:///c:/Users/u2388/OneDrive/Documents/Employee-Leave-Managament/ELMS_API_Collection.postman_collection.json)
- **PowerShell API Test Runner:** [`run_api_tests.ps1`](file:///c:/Users/u2388/OneDrive/Documents/Employee-Leave-Managament/run_api_tests.ps1)
- **Node.js API Test Runner:** [`run_api_tests.js`](file:///c:/Users/u2388/OneDrive/Documents/Employee-Leave-Managament/run_api_tests.js)

---

## Presentation Checklist & Flow

| # | Presentation Item | Artifact / Tool | Demonstration Focus |
|:-:|:---|:---|:---|
| **1** | **System Architecture Diagram** | [draw.io](https://app.diagrams.net/) / [`ELMS_System_Architecture.drawio`](file:///c:/Users/u2388/OneDrive/Documents/Employee-Leave-Managament/ELMS_System_Architecture.drawio) | 3-Tier Enterprise Cloud Architecture, Tier isolation, protocols, database relationships, CI/CD pipeline |
| **2** | **Front-end Code Implementation** | VS Code (`src/`) & Live Web UI | Component hierarchy, role-based rendering (Employee vs Manager), date calculation, modal workflows, design system |
| **3** | **Back-end Code Implementation** | VS Code (`backend/src/`) | Layered MVC, Spring Data JPA, `@Transactional` auto-deduction engine, quota validation, CORS security |
| **4** | **API Testing Demonstration** | Postman / [`run_api_tests.ps1`](file:///c:/Users/u2388/OneDrive/Documents/Employee-Leave-Managament/run_api_tests.ps1) | 10 API endpoints, status assertions (200 OK & 400 Bad Request), negative edge cases, balance audit |

---

# SECTION 1: System Architecture Diagram (draw.io)

### How to Open & Present the Diagram in draw.io
1. Navigate to [draw.io](https://app.diagrams.net/) in your web browser (or use the VS Code *Draw.io Integration* extension).
2. Click **Open Existing Diagram** and select [`ELMS_System_Architecture.drawio`](file:///c:/Users/u2388/OneDrive/Documents/Employee-Leave-Managament/ELMS_System_Architecture.drawio) located in the project root directory.
3. Alternatively, you can view or insert the vector graphic [`ELMS_System_Architecture.svg`](file:///c:/Users/u2388/OneDrive/Documents/Employee-Leave-Managament/ELMS_System_Architecture.svg) directly in presentation slides or browsers.

```
+-------------------------------------------------------------------------------------------------------------+
|                                    ELMS SYSTEM ARCHITECTURE OVERVIEW                                        |
+-------------------------------------------------------------------------------------------------------------+
|                                                                                                             |
|  [ 1. PRESENTATION TIER ]            [ 2. APPLICATION LOGIC TIER ]             [ 3. DATA PERSISTENCE TIER ] |
|  • React 18 (Vite SPA)               • Spring Boot 3.4.1 (Java 21)             • MySQL 9.6 (Local Server)    |
|  • Role Views (Emp/Mgr)    ==HTTPS==>• REST Controllers (Auth, Leave)   ==JDBC==>• Tables: users, balances, |
|  • Date & Quota Validation (JSON/443)• @Transactional Service Layer  (Port:3307)   applications             |
|  • Vercel Edge Network CDN           • Spring Data JPA / Hibernate             • HikariCP Pooler (Max: 10)  |
|                                      • Docker Container on Render                                           |
|                                                                                                             |
+-------------------------------------------------------------------------------------------------------------+
|  [ CI/CD & TESTING ] GitHub Monorepo  ==>  Vercel Frontend Build  ==>  Render Backend  ==>  Postman / Test |
+-------------------------------------------------------------------------------------------------------------+
```

### Architectural Talking Points for the Reviewers

1. **Presentation Tier (Frontend)**:
   - Built with **React 18** and **Vite** for optimized build performance and hot-reloading.
   - Deployed on **Vercel Edge Network** with global Anycast CDN, instant cache invalidation, and automated HTTPS certificate provisioning.
   - Decoupled into Role-Based Views (`EmployeeDashboard`, `ManagerApprovals`, `LeaveCalendar`) and Modular Components (`ApplyLeaveModal`, `LeaveHistoryTable`, `CalendarView`).
   - Unified CSS Design System in [`src/index.css`](file:///c:/Users/u2388/OneDrive/Documents/Employee-Leave-Managament/src/index.css) using design tokens (CSS variables) for modern enterprise aesthetics.

2. **Communication & Security Gateway**:
   - Communication between Frontend and Backend occurs strictly via **HTTPS / RESTful JSON** payloads.
   - **CORS Protection**: Handled via [`WebConfig.java`](file:///c:/Users/u2388/OneDrive/Documents/Employee-Leave-Managament/backend/src/main/java/com/company/elms/config/WebConfig.java) to allow cross-origin communication between the Vercel cloud frontend and Render cloud backend while safeguarding sensitive methods.

3. **Application Logic Tier (Backend)**:
   - Powered by **Java 21 LTS** and **Spring Boot 3.4.1**.
   - Strict Layered Architecture: **Controller Layer** maps HTTP requests to DTOs; **Service Layer** enforces business constraints and transactional state changes; **Repository Layer** abstracts database operations through Spring Data JPA.
   - Containerized using a multi-stage [`Dockerfile`](file:///c:/Users/u2388/OneDrive/Documents/Employee-Leave-Managament/Dockerfile) (`maven:3.9-eclipse-temurin-21` -> `eclipse-temurin:21-jre`) deployed as a Linux container on **Render Cloud Services**.

4. **Data Tier (Persistence)**:
   - Running **MySQL 9.6** as the local relational database server (port 3307).
   - Configured with **HikariCP** connection pooling (`maximum-pool-size=10`) for optimal performance.
   - Relational schema features foreign key constraints (`ON DELETE CASCADE`) connecting `users` to `leave_balances` and `leave_applications`.

---

# SECTION 2: Code Implementation Demonstration

## 2.1 Front-end Code Tour

### Key Files & What to Showcase

#### 1. Central Router & State Management: [`src/App.jsx`](file:///c:/Users/u2388/OneDrive/Documents/Employee-Leave-Managament/src/App.jsx)
- **Role Isolation**: Controls access based on `currentUser.role` (`EMPLOYEE` vs `MANAGER`).
- **Dynamic Tab Switching**: Manages view navigation (`dashboard`, `apply`, `my-leaves`, `approvals`, `team-balances`, `calendar`, `profile`).
- **Interactive State Handlers**: Demonstrates `handleApplyLeave()`, `handleReview()`, and `handleCancelLeave()` which instantly refresh dashboard quota cards upon state transitions.

#### 2. Leave Application Modal: [`src/components/ApplyLeaveModal.jsx`](file:///c:/Users/u2388/OneDrive/Documents/Employee-Leave-Managament/src/components/ApplyLeaveModal.jsx)
- **Client-Side Date Math**: Auto-calculates working days when dates are selected.
- **Quota Guard**: Compares requested days against remaining balance before submission:
  ```javascript
  const selectedBalance = balances[leaveType]?.remaining || 0;
  if (daysCount > selectedBalance) {
    setError(`Insufficient balance. You have ${selectedBalance} days remaining.`);
    return;
  }
  ```

#### 3. Manager Approvals & Rejections: [`src/views/ManagerApprovals.jsx`](file:///c:/Users/u2388/OneDrive/Documents/Employee-Leave-Managament/src/views/ManagerApprovals.jsx)
- Displays pending leave requests with reviewer modal.
- Captures reviewer comments and triggers atomic backend balance deduction upon approval.

#### 4. Department Leave Calendar: [`src/components/CalendarView.jsx`](file:///c:/Users/u2388/OneDrive/Documents/Employee-Leave-Managament/src/components/CalendarView.jsx)
- Renders full monthly calendar grid mapping employee leave spans to detect scheduling conflicts across department members.

#### 5. API Client Service: [`src/services/api.js`](file:///c:/Users/u2388/OneDrive/Documents/Employee-Leave-Managament/src/services/api.js)
- Unified HTTP fetch wrapper with error handling and dynamic `VITE_API_URL` environment configuration.

---

## 2.2 Back-end Code Tour

### Key Files & Architectural Highlights

#### 1. REST Controllers: [`AuthController.java`](file:///c:/Users/u2388/OneDrive/Documents/Employee-Leave-Managament/backend/src/main/java/com/company/elms/controller/AuthController.java) & [`LeaveController.java`](file:///c:/Users/u2388/OneDrive/Documents/Employee-Leave-Managament/backend/src/main/java/com/company/elms/controller/LeaveController.java)
- Clear separation of concerns: Maps HTTP verbs (`GET`, `POST`, `PUT`), binds `@RequestBody` DTOs, and returns uniform `ResponseEntity<?>`.
- Handles user identity via `@RequestHeader(value = "X-User-Id")` or query parameters.

#### 2. Transactional Business Logic: [`LeaveService.java`](file:///c:/Users/u2388/OneDrive/Documents/Employee-Leave-Managament/backend/src/main/java/com/company/elms/service/LeaveService.java)
- **Auto-Deduction Engine**: Show line 79 to line 105:
  ```java
  @Transactional
  public LeaveApplication reviewApplication(Long id, String reviewerName, String status, String comments) {
      LeaveApplication app = leaveApplicationRepository.findById(id)
              .orElseThrow(() -> new RuntimeException("Leave application not found."));

      if (!"PENDING".equalsIgnoreCase(app.getStatus())) {
          throw new RuntimeException("This application has already been processed.");
      }

      app.setStatus(status.toUpperCase());
      app.setReviewedBy(reviewerName);
      app.setReviewedOn(LocalDate.now());
      app.setReviewerComments(comments);

      // Atomic Balance Deduction
      if ("APPROVED".equalsIgnoreCase(status)) {
          LeaveBalance balance = leaveBalanceRepository.findByUserIdAndLeaveType(app.getUser().getId(), app.getLeaveType())
                  .orElseThrow(() -> new RuntimeException("Leave balance record not found."));

          balance.setUsed(balance.getUsed() + app.getDaysCount());
          balance.setRemaining(Math.max(0, balance.getTotal() - balance.getUsed()));
          leaveBalanceRepository.save(balance);
      }
      return leaveApplicationRepository.save(app);
  }
  ```
- **Explain to Reviewers**: The `@Transactional` annotation guarantees ACID compliance. If saving the updated balance fails, the application status update automatically rolls back, preventing orphaned state or corrupted quotas.

#### 3. Automatic Data Seeding: [`DataSeeder.java`](file:///c:/Users/u2388/OneDrive/Documents/Employee-Leave-Managament/backend/src/main/java/com/company/elms/DataSeeder.java)
- Implements `CommandLineRunner` to seed test users (`Nainika`, `Apoorva`, `Natasha`, `Sarvani`, `Sahaja`) with statutory leave entitlements (18 Annual, 10 Sick, 7 Casual) and historical leave applications on application startup.

---

# SECTION 3: API Testing Demonstration

You have **three methods** to demonstrate API testing during your review:

## Method A: Automated Test Runner Script (Recommended - Fastest & Most Impressive)

Run the automated test runner in PowerShell or terminal. It validates status codes, payload structures, and error responses with formatted color output.

### Option 1 (PowerShell):
```powershell
.\run_api_tests.ps1
```
*(To test against deployed cloud server: `.\run_api_tests.ps1 -BaseUrl "https://employee-leave-managament.onrender.com"`)*

### Option 2 (Node.js):
```bash
node run_api_tests.js
```
*(To test against deployed cloud server: `node run_api_tests.js https://employee-leave-managament.onrender.com`)*

**Sample Execution Output:**
```text
=================================================================
   EMPLOYEE LEAVE MANAGEMENT SYSTEM (ELMS) - API TEST RUNNER     
   Target URL: http://localhost:8085
=================================================================

[TC-01] POST /api/auth/login - Valid Employee Login
       [PASS] Status: 200 (42ms)

[TC-02] POST /api/auth/login - Invalid Credentials Rejection
       [PASS] Status: 400 (18ms)

[TC-03] GET /api/users - Fetch All Users List
       [PASS] Status: 200 (25ms)

[TC-04] GET /api/users/1/balances - Fetch Employee Quota Balances
       [PASS] Status: 200 (22ms)

[TC-05] GET /api/users/all-balances - Fetch Department Balance Matrix
       [PASS] Status: 200 (28ms)

[TC-06] GET /api/leaves - Filter Leaves for Employee (Role Isolation)
       [PASS] Status: 200 (31ms)

[TC-07] GET /api/leaves - Filter Leaves for Manager View
       [PASS] Status: 200 (33ms)

[TC-08] POST /api/leaves - Reject Request Exceeding Remaining Quota
       [PASS] Status: 400 (20ms)

=================================================================
                      TEST RESULTS SUMMARY                       
=================================================================
   Total Tests Executed : 8
   Tests Passed         : 8
   Tests Failed         : 0
   Pass Rate            : 100.0%
=================================================================
```

---

## Method B: Postman Collection Demonstration

1. Open **Postman**.
2. Click **Import** (top left).
3. Select [`ELMS_API_Collection.postman_collection.json`](file:///c:/Users/u2388/OneDrive/Documents/Employee-Leave-Managament/ELMS_API_Collection.postman_collection.json).
4. Click **Run Collection** -> **Run ELMS Suite**.
5. All 11 requests run with automated test scripts validating:
   - `pm.response.to.have.status(200)`
   - Property assertions for user profile, quotas, and status flags.

---

## Method C: Live cURL Demonstrations

You can execute these individual cURL commands directly in the terminal to demonstrate specific APIs to the examiners:

### 1. User Authentication (Login)
```bash
curl -X POST http://localhost:8085/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nainika@company.com","password":"password"}'
```
**Expected Response:** `200 OK` with User JSON (`id`, `name`, `email`, `role: "EMPLOYEE"`).

### 2. Fetch User Leave Balances
```bash
curl http://localhost:8085/api/users/1/balances
```
**Expected Response:** `200 OK` with JSON dictionary mapping `ANNUAL`, `SICK`, and `CASUAL` quotas (`total`, `used`, `remaining`).

### 3. Submit a New Leave Application
```bash
curl -X POST "http://localhost:8085/api/leaves?queryUserId=1" \
  -H "Content-Type: application/json" \
  -d '{"leaveType":"CASUAL","startDate":"2026-10-15","endDate":"2026-10-16","daysCount":2,"reason":"Personal family event"}'
```
**Expected Response:** `200 OK` with created `LeaveApplication` record showing `status: "PENDING"` and generated `leaveCode` (e.g., `LV-0005`).

### 4. Negative Test: Exceeding Available Balance
```bash
curl -X POST "http://localhost:8085/api/leaves?queryUserId=1" \
  -H "Content-Type: application/json" \
  -d '{"leaveType":"CASUAL","startDate":"2026-10-15","endDate":"2026-11-20","daysCount":99,"reason":"Exceed quota"}'
```
**Expected Response:** `400 Bad Request` with `{"error": "Insufficient leave balance! Available: X days."}`.

### 5. Manager Review (Approve Leave & Trigger Auto-Deduction)
```bash
curl -X PUT "http://localhost:8085/api/leaves/1/review?queryReviewerName=Apoorva" \
  -H "Content-Type: application/json" \
  -d '{"status":"APPROVED","reviewerComments":"Approved by Engineering Lead."}'
```
**Expected Response:** `200 OK` with updated status `APPROVED`, reviewer name `Apoorva`, and timestamp.

---

# SECTION 4: Expected Review Questions & Model Answers

### Q1: Why did you choose a 3-tier architecture instead of a monolith?
> **Answer:** "The 3-tier architecture provides strict separation of concerns between presentation (React 18 SPA), business logic (Spring Boot REST API), and data storage (MySQL). This allows independent deployment and scaling—for example, our frontend is hosted on Vercel's global CDN while our backend runs as a container on Render. If we need to replace the frontend or introduce a mobile app in the future, the backend REST services remain completely unchanged."

### Q2: How do you guarantee that leave balances don't get corrupted if two managers review requests at once?
> **Answer:** "All review operations in `LeaveService.java` are annotated with `@Transactional`. When a leave approval is processed, Spring and Hibernate execute the application status update and the balance deduction within a single atomic database transaction. Additionally, we verify that the application status is strictly `PENDING` before processing; if it has already been approved or rejected, an exception is thrown immediately."

### Q3: How do you prevent employees from submitting leaves for dates in the past or where the start date is after the end date?
> **Answer:** "We employ defense-in-depth with two layers of validation:
> 1. **Client-side**: In `ApplyLeaveModal.jsx`, input date pickers restrict selection and JavaScript calculates `endDate >= startDate`.
> 2. **Server-side**: In `LeaveService.java:applyLeave()`, we check `if (dto.getStartDate().isAfter(dto.getEndDate()))` and throw a `400 Bad Request` runtime exception if invalid."

### Q4: How is session/authentication managed without cookies?
> **Answer:** "Upon successful login via `POST /api/auth/login`, the authenticated user profile is persisted in the browser's `localStorage`. The frontend attaches user identification to outgoing API requests via `X-User-Id` request headers and query parameters, which our controllers validate on every incoming request."

### Q5: What database connection pooling strategy are you using?
> **Answer:** "We use HikariCP, the high-performance default connection pool in Spring Boot. We configured the pool in `application.properties` with `maximum-pool-size=10` and connection timeouts to ensure efficient database connection reuse with our MySQL server."
