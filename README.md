# MaziwaHub - Elgon Valley Dairy Cooperative Backend

MaziwaHub is a secure, structured web backend designed for the Elgon Valley Dairy Cooperative in Bungoma County. It manages 3,200 member farmers, 6 collection centres, and milk delivery tracking, replacing an unoptimized, un-vetted, and vulnerable legacy application stub.

## 👥 Group Project Assignment & Task Breakdown
This project is engineered as a shared repository where exactly five group members collaborate. Each member owns **ONE** dedicated task module:
*   **Task 1 (Server and Routes):** Express infrastructure, core routing optimization, error catching, and architectural restructuring.
*   **Task 2 (Database Design & SQL Reports):** Relational schema normalisation, 3-table implementation, integrity constraints, and metric reports.
*   **Task 3 (REST API & Farmer Portal Pagination):** Complete REST endpoint compliance, HTTP status codes management, and a paginated frontend portal consumer.
*   **Task 4 (Login, Hashing & Access Control):** Authentication, SQL Injection defense, Bcrypt encryption, JWT session management, and Role-Based Access Control (RBAC).
*   **Task 5 (Automated Testing, Multer Uploads & Deployment):** Jest/Supertest integration suites, strict mime-type file parsing, and cloud environment deployment.

## 🛠️ Prerequisites & Installation
Ensure you have **Node.js (v18+)** and a **MySQL Server** instance executing locally.

1. Clone the workspace repository:
   ```bash
   git clone <your-repository-url>
   cd maziwaHub
   ```
2. Install all required core and development dependencies:
   ```bash
   npm install
   ```
3. Establish your localized system credentials inside an environment configuration file:
   ```bash
   cp .env.example .env
   ```
   *Open `.env` and fill in your actual local MySQL root password and JWT custom strings.*

4. Import the relational database tables structure:
   ```bash
   mysql -u root -p < src/config/schema.sql
   ```

## 🚀 Execution Routines
*   **Development Watch Mode (Nodemon Hot Reloading):**
    ```bash
    npm run dev
    ```
*   **Production Standalone Invocation:**
    ```bash
    npm start
    ```
*   **Automated Validation Suite execution (Jest):**
    ```bash
    npm test
    ```
