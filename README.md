# LeaveFlow - Employee Leave Management System (ELMS)

A full-stack, cloud-deployed Employee Leave Management System designed to streamline employee leave applications, automated balance calculations, and manager approval workflows.

---

## 🌐 Live Demo & Deployment

| Component | Platform | URL |
| :--- | :--- | :--- |
| **Frontend Application** | Vercel | [https://employee-leave-managament.vercel.app](https://employee-leave-managament.vercel.app) |
| **Backend REST API** | Render | [https://employee-leave-managament.onrender.com](https://employee-leave-managament.onrender.com) |
| **Database** | MySQL 9.6 | Local / Network MySQL Server |

---

## 🔑 Demo Credentials

| Role | Name | Email Address | Password |
| :--- | :--- | :--- | :--- |
| **Employee** | Nainika | `nainika@company.com` | `password` |
| **Employee** | Natasha | `natasha@company.com` | `password` |
| **Employee** | Sarvani | `sarvani@company.com` | `password` |
| **Manager** | Apoorva | `apoorva@company.com` | `password` |

---

## ✨ Features

### 👤 Employee Portal
- **Dashboard Overview**: Live visual cards for Annual, Sick, and Casual leave allowances with real-time remaining day counters.
- **Apply for Leave**:
  - Dynamic date calculation with auto-computed total days count.
  - Client-side and server-side leave balance validation.
- **My Leave Applications**: Full status tracking (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`).
- **Cancel Leave**: Employees can cancel their own `PENDING` leave requests before review.

### 🛡️ Manager Portal
- **Approval Queue**: Review pending leave applications with employee details, reason, and duration.
- **Actionable Reviews**: Approve or Reject requests with customized reviewer feedback.
- **Automated Balance Deduction**: Upon approval, leave days are atomically deducted from the employee's specific balance category.
- **Team Overview & Calendar**: Department-wide leave history, team balances summary, and a team leave calendar.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Vanilla CSS (Tailored warm palette, responsive layouts, glassmorphism)
- **Icons**: Lucide React
- **Deployment**: Vercel

### Backend
- **Framework**: Java 21 + Spring Boot 3
- **ORM / Persistence**: Spring Data JPA / Hibernate
- **Database**: MySQL 9.6 (Local Server, port 3307)
- **Containerization**: Docker
- **Deployment**: Render (Web Service)

---

## 📁 Project Structure

```text
Employee-Leave-Managament/
├── backend/                              # Spring Boot REST API
│   ├── src/main/java/com/company/elms/
│   │   ├── config/                       # CORS & Web MVC configuration
│   │   ├── controller/                   # REST API Controllers (Auth, Leaves)
│   │   ├── dto/                          # Data Transfer Objects
│   │   ├── model/                        # JPA Entities (User, LeaveBalance, LeaveApplication)
│   │   ├── repository/                   # Spring Data JPA Repositories
│   │   └── service/                      # Business Logic & Transactional Services
│   ├── src/main/resources/
│   │   └── application.properties        # Application configuration & env var bindings
│   └── pom.xml                           # Maven dependencies
├── src/                                  # React Frontend Source
│   ├── components/                       # Modular UI Components (Navbar, Cards, Modals)
│   ├── views/                            # Role-based Page Views (Employee & Manager)
│   ├── services/                         # API Service Client & Storage Helpers
│   ├── App.jsx                           # Application Router & State Manager
│   └── index.css                         # Global Design System
├── Dockerfile                            # Multi-stage Docker build for backend
├── ELMS_Test_Cases.md                    # Academic SRS Test Cases Document
├── package.json                          # Frontend dependencies
└── vite.config.js                        # Vite build configuration
```

---

## 🚀 Running Locally

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Java JDK 21** & **Maven**
- **MySQL 9.6** (or MySQL 8.0+)

### 1. Backend Setup
```powershell
cd backend

# Set environment variables (or configure backend/src/main/resources/application.properties)
$env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3307/elms_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:SPRING_DATASOURCE_USERNAME="root"
$env:SPRING_DATASOURCE_PASSWORD="root"
$env:PORT="8085"

# Run Spring Boot
mvn spring-boot:run
```
Backend will start on `http://localhost:8085`.

### 2. Frontend Setup
```powershell
# From project root
npm install
npm run dev
```
Frontend will start on `http://localhost:3000`.

---

## 📡 REST API Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user credentials |
| `GET` | `/api/users` | Retrieve all registered users |
| `GET` | `/api/users/{id}/balances` | Get specific user's leave balances |
| `GET` | `/api/users/all-balances` | Get team leave balance summary (Manager) |
| `GET` | `/api/leaves` | List leave applications (Filtered by user/role) |
| `POST` | `/api/leaves` | Submit new leave application |
| `PUT` | `/api/leaves/{id}/review` | Approve or Reject a leave application |
| `PUT` | `/api/leaves/{id}/cancel` | Cancel a pending leave application |

---

## 📄 Academic Documentation
- Comprehensive Software Requirements Specification (SRS) test cases are documented in [ELMS_Test_Cases.md](file:///ELMS_Test_Cases.md), covering 24 test cases across 8 functional modules.
