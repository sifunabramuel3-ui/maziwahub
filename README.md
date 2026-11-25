# MaziwaHub - Elgon Valley Dairy Cooperative Backend

MaziwaHub is a Node.js and Express backend with a MySQL database developed for the Elgon Valley Dairy Cooperative in Bungoma County to manage members, milk delivery tracking, reports, security, and verification.

## 👥 Project Team & Responsibilities

The repository is structured around five core collaborative roles focusing on server routes, database schema, REST APIs, authentication/access control, and testing/deployment.

## 🛠️ Local Setup and Installation

### 1. Clone and Install

Clone the repository and install the required dependencies:

```bash
git clone https://github.com/sifunabramuel3-ui/maziwahub.git
cd maziwahub
npm install
if using xammp
/c/xampp/mysql/bin/mysql.exe -u root -p < "./src/config/schema.sql"


## Farmer portal and Task 3 API

After configuring the database and environment variables, start the server:

```bash
npm start
```

Open the farmer portal at `http://localhost:5000/portal.html`. It signs in through `POST /api/auth/login` and loads the signed-in farmer's records through `GET /api/farmers/my-deliveries?page=1&limit=5`.

The farmer endpoint returns a `data` array and `pagination` metadata (`page`, `limit`, `total`, `totalPages`). The default page size is five; accepted limits are 1–100. Invalid page or limit values return HTTP 400. The farmer identity comes from the verified JWT, not a client-supplied farmer ID.

The staff delivery list is `GET /api/deliveries?page=1&limit=5` and requires a clerk or manager token.

### CORS configuration

Set `CORS_ORIGIN` to a comma-separated list of trusted browser origins, for example:

```env
CORS_ORIGIN=http://localhost:5500,https://your-approved-portal.example
```

The portal served by this Express app is same-origin and does not need a CORS exception. Do not use a wildcard origin in production.
