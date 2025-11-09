# hire.io Backend API Documentation

This document details the RESTful API for the **hire.io** Job Placement Platform. All endpoints use JSON for request and response bodies and require **JWT-based authentication** for protected routes.

---

## Base URL
```
http://localhost:{specified-port}
```

---

## Authentication Endpoints (`/api/auth`)

Handles user registration, login, and profile access for **Students**, **Companies**, and **Admins**.

| Method | Endpoint               | Description                                              | Access             |
|--------|------------------------|----------------------------------------------------------|--------------------|
| POST   | `/api/auth/register`   | Register a new user (role: `student`, `company`, `admin`) | Public             |
| POST   | `/api/auth/login`      | Login and receive JWT token (role required in body)       | Public             |
| GET    | `/api/auth/profile`    | Get authenticated user’s profile                          | Authenticated      |

### Register Example
```json
POST /api/auth/register
{
  "role": "student",
  "student_name": "Alex Johnson",
  "email": "alex@college.edu",
  "password": "securePass123"
}
```

**Response:**
```json
{
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login Example
```json
POST /api/auth/login
{
  "role": "company",
  "email": "hr@techcorp.com",
  "password": "companyPass!"
}
```

---

## Job Endpoints (`/api/jobs`)

Manage job postings — viewable by all, creatable/editable by **Companies** and **Admins**.

| Method | Endpoint           | Description                                                  | Access             |
|--------|--------------------|--------------------------------------------------------------|--------------------|
| GET    | `/api/jobs`        | List all open job postings                                   | Public             |
| POST   | `/api/jobs`        | Create a new job (company_id must match authenticated user)  | Company            |
| GET    | `/api/jobs/:id`    | Get job by ID with company & candidate details               | Public             |
| PUT    | `/api/jobs/:id`    | Update job (owner company or admin only)                     | Company, Admin     |
| DELETE | `/api/jobs/:id`    | Delete job                                                   | Admin              |

### Create Job Example
```json
POST /api/jobs
Authorization: Bearer <JWT>
{
  "company_id": "60c72b2f9b1d8e0015f620f4",
  "job_name": "Software Engineering Intern",
  "job_description": "Build scalable backend services with Node.js and TypeScript.",
  "opening_status": "open"
}
```

---

## Company Endpoints (`/api/companies`)

Manage company profiles and listings.

| Method | Endpoint                | Description                                              | Access             |
|--------|-------------------------|----------------------------------------------------------|--------------------|
| GET    | `/api/companies`        | List all companies                                       | Admin              |
| POST   | `/api/companies`        | Create company profile (admin or via register)           | Admin              |
| GET    | `/api/companies/:id`    | Get company with job listings                            | Public             |
| PUT    | `/api/companies/:id`    | Update company profile                                   | Company, Admin     |
| DELETE | `/api/companies/:id`    | Delete company and all associated jobs                   | Admin              |

---

## Student Endpoints (`/api/students`)

Manage student profiles and visibility.

| Method | Endpoint                | Description                                              | Access                     |
|--------|-------------------------|----------------------------------------------------------|----------------------------|
| GET    | `/api/students`         | List all student profiles                                | Admin, Company             |
| POST   | `/api/students`         | Create student profile (admin or via register)           | Admin                      |
| GET    | `/api/students/:id`     | Get student profile                                      | Student (self), Admin, Company |
| PUT    | `/api/students/:id`     | Update student profile                                   | Student (self), Admin      |
| DELETE | `/api/students/:id`     | Delete student profile                                   | Admin                      |

### Update Student Profile
```json
PUT /api/students/60d5ec49f1b2c8a7e4a1b2c3
{
  "student_description": "Top-tier CS graduate specializing in AI/ML.",
  "skills": ["Python", "TensorFlow", "React", "Node.js"],
  "current_status": "actively_applying"
}
```

---

## Admin Endpoints (`/api/admins`)

Admin account management (restricted operations).

| Method | Endpoint              | Description                                      | Access         |
|--------|-----------------------|--------------------------------------------------|----------------|
| GET    | `/api/admins`         | List all admin accounts                          | Admin          |
| POST   | `/api/admins`         | Create new admin (initial setup or superadmin)   | Public (setup) |
| GET    | `/api/admins/:id`     | Get admin profile                                | Admin          |
| PUT    | `/api/admins/:id`     | Update admin details                             | Admin          |
| DELETE | `/api/admins/:id`     | Delete admin account                             | Admin          |

---

## HTTP Status Codes & Errors

hire.io uses standard HTTP codes with consistent JSON error formatting.

| Code | Meaning                     | Example Response |
|------|-----------------------------|------------------|
| `200` | OK                          | `{ "data": ... }` |
| `201` | Created                     | `{ "job": { ... } }` |
| `204` | No Content (DELETE success) | *(empty)* |
| `400` | Bad Request                 | `{ "success": false, "message": "Email is required" }` |
| `401` | Unauthorized                | `{ "success": false, "message": "Invalid token" }` |
| `403` | Forbidden                   | `{ "success": false, "message": "Role 'student' not authorized" }` |
| `404` | Not Found                   | `{ "success": false, "message": "Job not found" }` |
| `500` | Server Error                | `{ "success": false, "message": "Internal server error" }` |

---

## Quick Start Guide

### 1. Login as Admin
```bash
curl -X POST {base-url}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hire.io",
    "password": "adminSecret2025",
    "role": "admin"
  }'
```

→ Save the `token` from response.

### 2. Access Protected Route
```bash
curl {base-url}/api/companies \
  -H "Authorization: Bearer <your_jwt_token>"
```

> Only works if token belongs to an **Admin**.

---

**hire.io** — Connecting Talent with Opportunity.  
*Built for scale. Secured by design.*