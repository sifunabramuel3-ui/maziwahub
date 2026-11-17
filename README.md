
MaziwaHub - Elgon Valley Dairy Cooperative Backend

MaziwaHub is a Node.js and Express backend with a MySQL database developed for the Elgon Valley Dairy Cooperative in Bungoma County to manage members, milk delivery tracking, reports, security, and verification.

👥 Project Team & Responsibilities

The repository is structured around five core collaborative roles focusing on server routes, database schema, REST APIs, authentication/access control, and testing/deployment.

🛠️ Local Setup and Installation


1. Clone and Install

Clone the repository and install the required dependencies:
bash
git clone https://github.com/sifunabramuel3-ui/maziwahub.git
cd maziwahub
npm install
Use code with caution.

2. Database and Environment Configuration

• Database Schema: Execute src/config/schema.sql in your MySQL environment.
• Environment Variables: Configure your .env file with your local MySQL credentials, port settings, and a secure JWT_SECRET.

🚀 Running the Application

• Development Mode: npm run dev
• Production Mode: npm start
• Run Tests: npm test

🔍 Core API Endpoints

• Health Check: GET http://localhost:5000/health
• Deliveries Logs: GET http://localhost:5000/api/deliveries?page=1&limit=5 (Requires Bearer token)

