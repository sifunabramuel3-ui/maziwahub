Comprehensive Academic Evaluation Guide

Task 1: Server and Routes Documentation

• Workflow Operations Mechanics (Diagram Blueprint Analysis):
• Step 1: The collection point clerk types values into the user web input fields and triggers a submittal. The browser packages these metrics securely into a structured JSON string and transmits an HTTP POST request over connection pathways towards the /api/deliveries tracking route on the target server.
• Step 2: The underlying Express runtime architecture intercepts the payload. It pipes it systematically through custom validation middleware checks (requireLogin, authorizeRoles), matching verified JWT verification details. Next, it routes execution queries over active pool cluster pipelines down into the MySQL database engine tables.
• Step 3: The database processes the operation, saves the record, and returns a success confirmation. The Express controller catches this execution signal and sends an HTTP 201 Created status code response payload containing transaction summaries back up to the client web browser.
• Legacy Code Defect Diagnostic Analysis:
• GET /api/deliveries allowed unauthenticated access because it was declared above the registration statement of the requireLogin locking middleware module. Express evaluates routes sequentially from top to bottom.
• POST /api/deliveries triggered infinite web interface hanging screens on bad data entry because it lacked a fallback execution statement block (else) to return a response when the litres > 0 conditional test failed.

Task 2: Normalized Relational Database Layer Architecture

• Problems with Unnormalized Single-Table Architectures:
1. Data Insertion Inconsistencies & Modification Anomalies: As shown by Farmer F012 having distinct telephone rows (0700000111 vs 0700999888) across separate entries. This occurs because individual farmer details are repeated with every delivery, instead of being stored once in a dedicated table.
2. Redundant Storage & Data Overhead: Text values like Wafula Simiyu and Kimilili are repeated across thousands of delivery rows, wasting database memory storage.
• Normalized Entity Relationship Logic Blueprint:
• farmers table connects to the deliveries table via a 1-to-Many (1:N) mapping. A single member farmer can make multiple separate milk drop deliveries over time.
• centres table connects to the deliveries table via a 1-to-Many (1:N) mapping. A single collection point can receive many deliveries from different farmers.

Task 3: REST API & Farmer Portal Pagination Documentation

• REST Endpoint Compliance Schema Matrix:
1. Add a new farmer: POST /api/register (Success Status: 201 Created).
2. Record a delivery: POST /api/deliveries (Success Status: 201 Created).
3. List one farmer's deliveries: GET /api/deliveries (Success Status: 200 OK).
4. Correct the litres on a delivery: PUT /api/deliveries/:id (Success Status: 200 OK). Choosing PUT is best practice for modification requests because it replaces an existing resource entirely with the newly supplied, corrected record details.
5. Remove a delivery entered by mistake: DELETE /api/deliveries/:id (Success Status: 200 OK or 204 No Content). Choosing DELETE is standard practice because it explicitly flags and removes the targeted record from the persistent database.
• Cross-Origin Resource Sharing (CORS) System Protection Dynamics:
• Browsers implement a safety mechanism known as the Same-Origin Policy. If a frontend interface executing on port 3000 attempts to fetch data via network requests from a backend processing server on port 5000, the browser blocks it by default to prevent cross-site script execution leaks.
• To resolve this securely, the backend includes the cors() middleware package, which injects Access-Control-Allow-Origin: * headers into headers sent back to web clients.

Task 4: Identity Access Governance & Security Safeguards

• Legacy Code Security Exploitation Diagnosis:
1. SQL Injection Vulnerability: Incorporating user input directly via simple string concatenation (+ phone +) allowed attackers to bypass authentication entirely by injecting malicious SQL strings like ' OR '1'='1.
2. Plain-Text Password Vulnerability: Storing passwords as unencrypted plain text exposed all user credentials to full compromise if the database tables were leaked or viewed.
3. Weak Cryptographic Secret Key: Using a simple, guessable string (12345) meant attackers could easily forge valid authentication tokens offline using brute-force tools.
4. No Token Expiration Boundary: Leaving tokens valid indefinitely increased the window of opportunity for stolen session keys to be used maliciously.
• Role-Based Access Security Matrix (RBAC Verification Logs):

Action	Farmer	Clerk	Manager
View own payments	Yes	Yes	Yes
View any farmer's payments	No	Yes	Yes
Record a delivery	No	Yes	Yes
Approve the monthly payout	No	No	Yes


Task 5: Testing, Upload Management & Secure Production Deployment

• Value of Automated Integration Testing:
• If a test failed during building, it immediately alerted the team that a code change broke core features, caught logic errors before deployment, and prevented broken code from being pushed to production.
• File Upload Validation Vectors:
• Relying on the user-provided filename or client-supplied mime-types is a significant security risk. Malicious users can rename executable script files (e.g., backdoor.php) with safe extensions (e.g., backdoor.jpg) to bypass simple frontend checks. Once uploaded, these files can be executed on the server to compromise the system.
• MaziwaHub neutralizes this threat by using multer with disk storage routines that strip the user's filename, generate a unique random cryptographic hash, and thoroughly validate the internal file structure using server-side validation checks.
• Production Deployment Management Isolation Controls:
• Sensitive credentials like .env containing your database password and heavy local dependencies like node_modules must never be tracked in source control or pushed to GitHub. This prevents security leaks and repo bloat.
• When deploying live to cloud providers like Render or Railway, these production servers are configured securely by injecting environment values directly into the platform's native Environment Variables Dashboard.
Now that your academic project structure is established, would you like me to generate a mock data script to fill your tables with more testing entries or create a script to automatically install all these code files into your directory?
