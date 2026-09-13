# ELMS REVIEW PRESENTATION — DUMMY-PROOF STEP-BY-STEP SCRIPT
**Project:** Employee Leave Management System (ELMS)  
**Read this carefully:** Even if you know literally 0 about coding, just follow this line-by-line like a cooking recipe. It tells you **exactly what to click**, **where to point your mouse**, and **what exact English words to read out loud**.

---

## ⏱️ TEAM ORDER & TIME LIMIT (Total 10 Minutes)
1. **Member 1 (2 mins)** ➔ Architecture Diagram on draw.io
2. **Member 2 (3 mins)** ➔ *(RESERVED FOR YOU — We will do your Vercel demo script next!)*
3. **Member 3 (2 mins)** ➔ Backend Code in VS Code
4. **Member 4 (1.5 mins)** ➔ Database Tables in VS Code
5. **Member 5 (2 mins)** ➔ API Testing in Postman & Terminal

---
---

# 👤 MEMBER 1: System Architecture Diagram

### 🖱️ STEP 1: What to open on your computer BEFORE you speak
1. Open Google Chrome.
2. Go to website: **[https://app.diagrams.net](https://app.diagrams.net)** (draw.io).
3. Click the button that says **"Open Existing Diagram"**.
4. Select the file named **`ELMS_System_Architecture.drawio`** from your project folder.
   *(Backup: If draw.io won't open, just double-click the file `ELMS_System_Architecture.svg` in Chrome!)*
5. You will see 3 big boxes: **Blue (Left)**, **Green (Middle)**, **Purple (Right)**.

---

### 🗣️ STEP 2: Exact words to say and what to point at

#### 📍 Point 1: Introduction
* **Do this:** Point your mouse at the black top title bar.
* **Say this out loud:**
  > *"Good morning ma'am. Today our team is presenting the Employee Leave Management System, or ELMS.*
  > *In most companies, leave tracking is done on manual spreadsheets which causes errors and delay. Our system automates the whole process so employees can check remaining days and apply for leave, and managers can approve or reject with automatic balance deduction.*
  > *Here is our 3-Tier System Architecture diagram."*

#### 📍 Point 2: The Blue Box (Left)
* **Do this:** Move your mouse over the **Blue Box (Presentation Tier)**.
* **Say this out loud:**
  > *"First is the Presentation Tier on the left. This is our frontend web app built using React 18 and Vite. It provides dashboards for employees and managers, and is deployed on the Vercel cloud network with automatic HTTPS."*

#### 📍 Point 3: The Middle Blue Arrow
* **Do this:** Point your mouse at the arrow between Blue and Green that says **`HTTPS / REST / JSON`**.
* **Say this out loud:**
  > *"The frontend talks to our backend server over secure HTTPS using standard REST APIs with JSON data."*

#### 📍 Point 4: The Green Box (Middle)
* **Do this:** Move your mouse over the **Green Box (Application Tier)**.
* **Say this out loud:**
  > *"Second is the Application Tier in the middle. This is our backend REST API built using Spring Boot 3.4 and Java 21. It checks leave rules and runs our auto-deduction engine. It runs inside a Docker container on Render cloud."*

#### 📍 Point 5: The Middle Green Arrow & Purple Box (Right)
* **Do this:** Point your mouse at the arrow that says **`JDBC / MySQL`**, then circle the **Purple Box (Data Tier)**.
* **Say this out loud:**
  > *"Third is the Data Tier on the right. It connects over standard JDBC to our MySQL database `elms_db`, which permanently stores our users, balances, and leave applications as defined in SRS Section 3.7.*
  > *Now, Member 2 will demonstrate our live working website."*

---

### ❓ Questions the Teacher might ask Member 1 & what to say:
* **Teacher asks:** *"Why 3-tier architecture?"*
  * **You say:** *"Because it separates the frontend, backend, and database so we can update the website on Vercel without turning off the backend server."*
* **Teacher asks:** *"What protocol does frontend use to talk to backend?"*
  * **You say:** *"HTTPS with REST APIs and JSON format."*

---
---

# 👤 MEMBER 2: (RESERVED FOR YOU — LIVE VERCEL DEMO)
*(We will write your complete click-by-click script next!)*

---
---

# 👤 MEMBER 3: Back-End Code & Logic

### 🖱️ STEP 1: What to open on your computer BEFORE you speak
1. Open **VS Code**.
2. In the left file explorer, open this exact file:
   📁 `backend` ➔ `src` ➔ `main` ➔ `java` ➔ `com` ➔ `company` ➔ `elms` ➔ `service` ➔ **`LeaveService.java`**
3. Scroll down so line 45 to line 105 is visible on your screen.

---

### 🗣️ STEP 2: Exact words to say and what to point at

#### 📍 Point 1: Introduction to Backend
* **Do this:** Point your mouse at the top of the file.
* **Say this out loud:**
  > *"Hello ma'am. I will be demonstrating our Back-End implementation and the business logic.*
  > *Our backend is built using Spring Boot and Java 21 following the MVC pattern with Controllers, Services, and JPA Repositories."*

#### 📍 Point 2: Quota & Date Check
* **Do this:** Scroll to **Line 50** and highlight this code with your mouse:
  `if (dto.getDaysCount() > balance.getRemaining())`
* **Say this out loud:**
  > *"First, here in `LeaveService.java` at line 50, before accepting any leave, the server checks if the requested days are more than the employee's remaining balance. If an employee tries to cheat or apply for more days than they have, the server immediately rejects it with an error."*

#### 📍 Point 3: The Auto-Deduction Engine
* **Do this:** Scroll to **Line 79** (`reviewApplication`). Highlight **Line 99 and Line 100**:
  `balance.setUsed(balance.getUsed() + app.getDaysCount());`
  `balance.setRemaining(Math.max(0, balance.getTotal() - balance.getUsed()));`
* **Say this out loud:**
  > *"Second, here at line 99 is our Auto-Deduction Engine. When a manager clicks Approve, the system automatically adds the approved days to 'used', and subtracts them from 'remaining'.*
  > *Notice the `@Transactional` annotation at line 78 above this method. This guarantees ACID properties: if anything goes wrong while saving, it automatically cancels the changes so leave balances never get corrupted.*
  > *Now, Member 4 will explain our database schema."*

---

### ❓ Questions the Teacher might ask Member 3 & what to say:
* **Teacher asks:** *"What does `@Transactional` do?"*
  * **You say:** *"It makes sure the status update and the balance deduction happen together as one single atomic step. If one fails, both roll back."*
* **Teacher asks:** *"What happens if end date is before start date?"*
  * **You say:** *"Line 42 checks `if (dto.getStartDate().isAfter(dto.getEndDate()))` and throws an error message 'End date cannot be prior to start date'."*

---
---

# 👤 MEMBER 4: Database Schema & Configuration

### 🖱️ STEP 1: What to open on your computer BEFORE you speak
1. Open **VS Code**.
2. Open the file **`ELMS_Project_Report.md`** from the root folder.
3. Scroll down to **Line 93** where it says:
   `-- 1. Users Table`
   `CREATE TABLE users (`
4. In another tab, open `backend/src/main/resources/application.properties`.

---

### 🗣️ STEP 2: Exact words to say and what to point at

#### 📍 Point 1: Database Introduction & 3 Tables
* **Do this:** In `elms_database.sql`, point your mouse at line 6 (`CREATE DATABASE elms_db;`).
* **Say this out loud:**
  > *"Hello ma'am. I will be explaining our Database Schema and MySQL Configuration.*
  > *In strict accordance with SRS Section 3.7 and 3.10.3, our persistent storage is powered by MySQL using the InnoDB storage engine. Our database consists of 3 relational tables:*
  > *1. First, the `users` table: stores employee ID, name, email, password, and role which is either EMPLOYEE or MANAGER.*
  > *2. Second, the `leave_balances` table: tracks each employee's Annual leave with 18 days, Sick leave with 10 days, and Casual leave with 7 days.*
  > *3. Third, the `leave_applications` table: stores every leave request, start date, end date, total days, reason, and status like PENDING or APPROVED."*

#### 📍 Point 2: Foreign Keys & Cascading
* **Do this:** Highlight the words `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE` in `elms_database.sql`.
* **Say this out loud:**
  > *"Both the balances and applications tables have a Foreign Key linked to `users(id)` with `ON DELETE CASCADE`. This ensures that if a user is removed, all their leave records are automatically cleaned up without leaving broken data."*

#### 📍 Point 3: Connection Pool
* **Do this:** Click on the `application.properties` tab. Point your mouse at **Line 16**:
  `spring.datasource.hikari.maximum-pool-size=10`
* **Say this out loud:**
  > *"In our Spring Boot configuration, we use HikariCP for connection pooling. We set the maximum pool size to 10 connections for optimal throughput with our MySQL database.*
  > *Now, Member 5 will demonstrate our API Testing."*

---

### ❓ Questions the Teacher might ask Member 4 & what to say:
* **Teacher asks:** *"What database are you using?"*
  * **You say:** *"MySQL version 8.0 with InnoDB engine, configured in application.properties and schema.sql as defined in SRS Section 3.7."*
* **Teacher asks:** *"What does ON DELETE CASCADE mean?"*
  * **You say:** *"If an employee record is deleted from the users table, all their leave balances and applications are automatically deleted too."*

---
---

# 👤 MEMBER 5: API Testing (Postman)

### 🖱️ STEP 1: What to open on your computer BEFORE you speak
1. Open the **Postman** application.
2. Click **Import** button in Postman (top left).
3. Drag & drop the file named **`ELMS_API_Collection.postman_collection.json`** from the project folder.
4. On the left side of Postman, you will see a collection called **"ELMS - Employee Leave Management System API Suite"**. Click on it to expand the list of 11 requests.

---

### 🗣️ STEP 2: Exact words to say and what to click (Follow this like a recipe!)

#### 📍 Test 1: Positive Test (Login)
1. **Click on:** Request #1 named **`1. Authentication - Employee Login (Valid)`**.
2. **Point your mouse at:** The Body tab in the middle showing:
   ```json
   {
     "email": "nainika@company.com",
     "password": "password"
   }
   ```
3. **Click on:** The blue **"Send"** button on the right.
4. **Point your mouse at:** The bottom right showing green **`Status: 200 OK`** and the user profile JSON.
5. **Say this out loud:**
   > *"Hello ma'am. I will be demonstrating our API Testing.*
   > *API testing is essential to prove that our backend REST services work correctly and securely even without the frontend website.*
   > *First, here is our Login API. I sent the employee credentials, and the server responded with **Status: 200 OK** and returned the authenticated user object."*

---

#### 📍 Test 2: Fetch Balances
1. **Click on:** Request #4 named **`4. Balances - Get Leave Balances for User`**.
2. **Click on:** The blue **"Send"** button.
3. **Point your mouse at:** The JSON response showing `"ANNUAL"`, `"SICK"`, `"CASUAL"` with remaining days.
4. **Say this out loud:**
   > *"Second, here is the Balances API. Clicking Send retrieves the current remaining quota for Annual, Sick, and Casual leaves directly from our database with Status: 200 OK."*

---

#### 📍 Test 3: Negative Test (Crucial! Teachers love this!)
1. **Click on:** Request #9 named **`9. Leaves - Submit Leave Exceeding Quota (Negative 400)`**.
2. **Point your mouse at:** The Body tab showing `daysCount: 999`.
3. **Click on:** The blue **"Send"** button.
4. **Point your mouse at:** The red **`Status: 400 Bad Request`** and the error text:
   `"Insufficient leave balance! Available: ..."`
5. **Say this out loud:**
   > *"Third, this is our Negative Boundary Test. Here we tested what happens if an attacker bypasses the website and sends a raw HTTP request asking for 999 days of leave.*
   > *Notice the result: the backend caught it and rejected it with **Status: 400 Bad Request** and the message 'Insufficient leave balance'. This proves our backend validations are completely secure.*
   > *This concludes our presentation. Thank you ma'am!"*

---

### ❓ Questions the Teacher might ask Member 5 & what to say:
* **Teacher asks:** *"What is the difference between 200 OK and 400 Bad Request?"*
  * **You say:** *"200 OK means the request was valid and succeeded. 400 Bad Request means the server rejected invalid data, like asking for more leaves than available."*
* **Teacher asks:** *"Why do API testing if the website works?"*
  * **You say:** *"Because mobile apps or hackers could send requests directly to our API. API testing proves our server validates data on its own."*
