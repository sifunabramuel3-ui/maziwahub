# MaziwaHub — BIT 3120 CAT Implementation Review

**Review basis:** source files accessible on the default branch at the time of review. This is a source-code review, not a live runtime/test execution. The assignment brief (BIT 3120, Tasks 1–5) is the acceptance checklist.

## Summary

The project has foundational pieces for the database, delivery API, authentication and role middleware. However, the main `index.js` currently only configures CORS, JSON parsing and a database-backed health check; it does not mount the routes that have been created. Consequently, the routes are not reachable through the server as currently shown.

| CAT task | Status | Current evidence / gap |
|---|---|---|
| 1 Server & routes | Partial | Express entry point and route/controller files exist, but routes are not mounted in `index.js`. |
| 2 Database | Partial | SQL schema, relationships, CHECK constraint and sample rows exist; requested reports and live report route are not evidenced. |
| 3 REST API & portal | Partial | Delivery endpoints and farmer delivery endpoint exist. Portal HTML/JS, pagination parameter safeguards and CORS proof are not evidenced. |
| 4 Login & access control | Partial | Registration/login, bcrypt, parameterized queries, JWT expiry and role middleware exist. Role assignment at registration is unsafe; farmer ownership mapping needs review. |
| 5 Testing, uploads & deployment | Incomplete / not evidenced | No test files or upload route were located. Deployment and screenshots are not evidenced. |

## Findings by task

### Task 1 — Server and routes (6 marks)

**Implemented**
- Express server starts from `index.js`.
- JSON parsing and CORS middleware are configured.
- Delivery route handlers are separated into `src/routes/deliveries.js` and `src/controllers/deliveryController.js`.
- Delivery creation validates positive litres, checks farmer existence and responds with HTTP 201 on success.
- Delivery routes are protected by login and role middleware (clerk/manager).

**Critical integration gap**
- `index.js` does not import or mount `src/routes/deliveries.js` (or other route modules). The endpoints are therefore not connected to this server entry point.
- `index.js` contains no API route wiring; only `GET /health` is defined.

**Recommendations**
1. Mount routes in `index.js`, e.g. `app.use('/api/deliveries', deliveriesRouter)`, and mount authentication and farmer routes using consistent prefixes.
2. Confirm delivery GET authorization matches CAT requirements and whether managers/clerk are the only permitted roles.
3. Validate required fields, numeric types, date format, centre ID and rate before SQL insertion; return 400 for invalid input instead of relying on SQL errors.
4. Avoid returning raw database error messages to clients; log details server-side and return a generic 500 response.
5. Demonstrate the three Task 1 Postman requests with screenshots and document expected results (401/403 when unauthenticated or unauthorized, 201 for valid creation, 400 for invalid litres).

### Task 2 — Database (6 marks)

**Implemented**
- `src/config/schema.sql` defines `farmers`, `centres` and `deliveries`.
- Primary keys and delivery foreign keys are defined.
- A CHECK constraint enforces `Litres > 0`.
- The schema seeds the five sample deliveries from the brief, as well as farmer, clerk and manager profiles.
- The DB connection uses a MySQL pool and environment variables (`src/config/db.js`).

**Gaps / risks**
- The schema has no unique constraint on farmer phone numbers. Duplicate numbers could still be registered.
- The schema file truncates and reseeds tables on execution. This is destructive and should be clearly separated from production migrations/seeding.
- The report SQL and `GET /api/reports/farmer-totals` route were not found in reviewed files.
- Centre seeds include Kimilili and Chwele only, not all six centres in the case study.

**Recommendations**
1. Add a UNIQUE index on Phone, after cleaning any duplicate data; validate phone format at application level too.
2. Separate schema creation from sample-data seeding, and never run the reset/seed script against production data.
3. Add SQL reports: October 2026 totals grouped by farmer, and delivery counts grouped by centre.
4. Implement and mount the report endpoint and verify the JSON output.
5. Populate all six centres, or document that the current seed data is deliberately limited for the CAT exercise.

### Task 3 — REST API and Farmer Portal (6 marks)

**Implemented**
- `src/routes/deliveries.js` exposes GET and POST route handlers, secured to clerk/manager.
- Delivery list uses query parameters `page` and `limit` and SQL LIMIT/OFFSET.
- `src/routes/farmers.js` contains `GET /my-deliveries`, using the authenticated token identity in the query and pagination.
- The delivery list query joins farmers and centres.

**Gaps / risks**
- No farmer portal HTML/JavaScript page using `fetch()` was found.
- Pagination inputs are not bounded/validated. Non-numeric, negative or excessively large values should be rejected or clamped.
- The delivery list route does not return total row count or pagination metadata, which may complicate portal navigation.
- The farmer route uses `req.user.id` against `FarmerNo`; this matches the login token payload currently using FarmerNo, but confirm that all token sources use this exact identity format.
- CORS is globally open (`cors()`). For deployment, configure permitted origins intentionally.

**Recommendations**
1. Build the portal with a five-row table, Next/Previous controls, loading/error states and fetch requests with page/limit.
2. Add pagination validation and metadata (page, limit, total/count, possibly next/previous).
3. Ensure the farmer endpoint never accepts a farmer identifier from the URL/query as the authorization identity; use the verified token identity.
4. Test CORS from a different origin and record both the failing and successful browser evidence for the CAT.

### Task 4 — Login and Access Control (6 marks)

**Implemented**
- Registration hashes passwords with bcrypt (10 salt rounds).
- Login uses SQL placeholders and compares passwords with bcrypt.
- JWT is signed using `process.env.JWT_SECRET` and expires after one hour.
- Login response removes the Password property from the returned user.
- `src/middleware/authMiddleware.js` checks bearer tokens and provides role authorization.
- Roles currently supported by the middleware are checked against the token payload.

**Critical security issue**
- The register endpoint accepts `role` from the request body and inserts it directly. An untrusted registrant could attempt to register as manager or clerk. Role must not be user-controlled during public registration. Assign farmer by default; privileged roles should be provisioned by an authorized administrator.

**Additional risks**
- No input validation is evident for registration (required fields, phone format, password length, role).
- Phone and FarmerNo are checked for duplicates in application code but are not protected by unique constraints in the SQL schema; concurrent registrations may still race.
- Token verification responds with 403 for an invalid/expired token; many API conventions use 401 for missing/invalid authentication and 403 for authenticated users lacking permission. Document and consistently apply the chosen behavior.
- Role middleware does not by itself prove farmer payment ownership for every payment endpoint. The farmer-specific deliveries route does use token identity, but no payment/payout route was found.

**Recommendations**
1. Ignore or reject role in public registration and always create role='farmer'.
2. Add unique constraints on phone and farmer number and handle duplicate-key errors.
3. Validate registration/login fields and avoid exposing internal error messages.
4. Review every endpoint returning payments and enforce owner-specific queries.
5. Demonstrate F012 cannot access F047's records, and provide sanitized SQL evidence showing bcrypt hashes rather than plaintext passwords.

### Task 5 — Testing, uploads and deployment (6 marks)

**Implemented / evidenced**
- Jest and Supertest are listed as dev dependencies; `npm test` is configured.
- Multer is listed as a dependency.
- `.gitignore` includes `.env`, `node_modules/`, `uploads/` and `coverage/`.
- `GET /health` exists, but currently checks the DB and returns `{status: 'healthy', database: 'connected'}` or 500 with an unhealthy response rather than the brief's exact `{status:'ok'}`.

**Not evidenced in reviewed files**
- Jest/Supertest test files and passing test results for delivery creation.
- Certificate upload route, file filtering (PDF/JPG/PNG), 2 MB limit and randomized filenames.
- Live deployment URL or deployment configuration.

**Recommendations**
1. Add tests for valid delivery, missing/invalid litres, unauthenticated request and nonexistent farmer; mock or isolate DB setup where appropriate.
2. Add Multer upload validation for allowed extensions AND MIME/content checks; never trust user-supplied filename or MIME alone. Generate a unique server-side filename.
3. Set upload size limit to 2 MB, store uploads safely, and avoid exposing upload directories or executable files.
4. Provide a production deployment guide, environment-variable setup, database provisioning/migration instructions and live link.
5. Add a lightweight `GET /health` endpoint returning exactly `{status:'ok'}` (optionally retain a separate DB readiness check).

## Suggested completion checklist

- [ ] Mount all routers in `index.js`.
- [ ] Confirm API routes work in Postman against the running server.
- [ ] Enforce unique farmer phone numbers and farmer identifiers.
- [ ] Keep schema reset/seed scripts out of production workflows.
- [ ] Add and run SQL reports and mount the report endpoint.
- [ ] Build the farmer portal with pagination and CORS proof.
- [ ] Remove user-controlled role selection from public registration.
- [ ] Review access control and farmer ownership across payment/payout endpoints.
- [ ] Add automated delivery tests and show all passing.
- [ ] Implement secure certificate uploads with the specified restrictions.
- [ ] Align health endpoint response with the assignment.
- [ ] Document deployment and submit a live link.
- [ ] Collect screenshots/evidence for each CAT task.
- [ ] Re-check repository history for any previously committed secrets. If real secrets were ever committed, rotate them; deleting the current file alone does not invalidate leaked credentials.

## Scope and caveats

This review covers files fetched from the repository's default branch, including `index.js`, `package.json`, `src/config/db.js`, `src/config/schema.sql`, `src/controllers/deliveryController.js`, `src/middleware/authMiddleware.js`, `src/routes/deliveries.js`, `src/routes/farmers.js`, `src/routes/auth.js` and `.gitignore`. Directory listings, runtime execution, Postman tests, database execution, deployment status and screenshots were not available in this review. Missing files are described as **not evidenced/found**, not proof that they cannot exist elsewhere.
