# hire.io Backend API Documentation

> **Platform**: Job Placement Platform  
> **Base URL**: `http://localhost:{PORT}/api`  
> **Authentication**: JWT (Bearer Token) for protected routes  
> **External Integration**: [Neuron Matcher API]({{NEURON_SERVER_API}})  
> **Server Roles**: `student`, `company`, `admin`  
> **Current Time**: November 10, 2025 08:33 PM IST  
> **Country**: India

---

## Authentication Endpoints (`/api/auth`)

Handles user login, registration, and SSO for students.

| Method | Endpoint | Description | Access |
|--------|---------|-------------|--------|
| `POST` | `/register` | Register a new **Company** or **Admin** account | Public |
| `POST` | `/login` | Login for **Company** or **Admin** | Public |
| `POST` | `/sso/student` | SSO login/register for **Students** (name + email only) | Public |
| `GET`  | `/profile` | Get authenticated user’s profile & role | Authenticated |

### SSO Student Login Example

```json
POST /api/auth/sso/student
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@sso.edu"
}
```

> **Note**: Students **cannot** use `/register` or `/login`.

---

## Student Endpoints (`/api/students`)

Manage student profiles and AI-powered job matching.

| Method | Endpoint | Description | Access |
|--------|---------|-------------|--------|
| `GET`  | `/` | List all student profiles | Admin, Company |
| `POST` | `/` | Create a new student profile | Admin |
| `GET`  | `/:id` | Get student by ID | Student (self), Admin, Company |
| `PATCH`| `/:id` | Update student profile | Student (self), Admin |
| `DELETE`| `/:id` | Delete student profile | Admin |
| `PUT`  | `/:id/resume` | **Upload PDF resume** → forwards to Neuron API | Student (self), Admin |
| `GET`  | `/:id/match/jobs?count=N` | **Get job recommendations** from Neuron API | Student (self), Admin |

### Resume Upload (Multipart Form)

```http
PUT /api/students/123/resume
Content-Type: multipart/form-data
Authorization: Bearer <jwt>

form-data:
  resume: <pdf-file>
```

> Forwards: `user_id`, `username`, and `resume` to  
> `{{NEURON_SERVER_API}}/upload/resume`  
> Stores returned `resumeId` locally.

### Job Matching

```http
GET /api/students/123/match/jobs?count=5
```

- Queries `{{NEURON_SERVER_API}}/match/jobs?resumeId=...`
- Filters only **open jobs** from local DB
- Returns `400` if `resumeId` is missing

---

## Company Endpoints (`/api/companies`)

Manage company profiles. Email must be unique across **students** and **companies**.

| Method | Endpoint | Description | Access |
|--------|---------|-------------|--------|
| `GET`  | `/` | List all companies | Admin |
| `POST` | `/` | Create company profile | Admin |
| `GET`  | `/:id` | Get company + its jobs | Public |
| `PUT`  | `/:id` | Update company | Company (self), Admin |
| `DELETE`| `/:id` | Delete company | Admin |

> **Blocked**: Cannot register if email already used by a student (SSO).

---

## Job Endpoints (`/api/jobs`)

Manage job postings and candidate matching via Neuron API.

| Method | Endpoint | Description | Access |
|--------|---------|-------------|--------|
| `GET`  | `/` | List all **open** job postings | Public |
| `POST` | `/` | Create job → forwards to Neuron API | Company |
| `GET`  | `/:id` | Get job + company & candidate details | Public |
| `PUT`  | `/:id` | Update job | Company (owner), Admin |
| `DELETE`| `/:id` | Delete job | Admin |
| `GET`  | `/:id/match/candidates` | **Get candidate recommendations** | Company (owner), Admin |

### Job Creation Example

```json
POST /api/jobs
Content-Type: application/json
Authorization: Bearer <jwt>

{
  "company": "60c72b2f9b1d8e0015f620f4",
  "job_name": "Software Engineering Intern",
  "job_description": "Build scalable backend services with Node.js and TypeScript."
}
```

> - `company` = Local company ID (must match authenticated user)
> - Forwards `company name`, `job_title`, `description` → `{{NEURON_SERVER_API}}/upload/jobs`
> - Stores returned `job_id` locally

### Candidate Matching

```http
GET /api/jobs/abc123/match/candidates?count=5
```

- Queries `{{NEURON_SERVER_API}}/match/candidates?jobid=...`
- Only works if:
  - Job is **open**
  - No candidate already assigned
- Fails with `403` if unauthorized

---

## Admin Endpoints (`/api/admins`)

Admin account management and system analytics.

| Method | Endpoint | Description | Access |
|--------|---------|-------------|--------|
| `GET`  | `/` | List all admins | Admin |
| `POST` | `/` | Create admin (initial setup) | Public (Setup only) |
| `GET`  | `/:id` | Get admin profile | Admin |
| `PUT`  | `/:id` | Update admin | Admin |
| `DELETE`| `/:id` | Delete admin | Admin |
| `GET`  | `/analytics` | **Full system analytics** | Admin |

### Analytics Response Includes:
- Total counts: students, companies, jobs, admins
- Full data dumps (optional filtering)

---

## HTTP Status Codes & Error Handling

All errors return consistent JSON via `APIError` utility.

| Code | Meaning | Example Response |
|------|--------|------------------|
| `200` | OK | `{ "data": { ... } }` |
| `201` | Created | `{ "job": { ... } }` |
| `204` | No Content | *(empty body)* |
| `400` | Bad Request | `{ "success": false, "message": "Email is required" }` |
| `401` | Unauthorized | `{ "success": false, "message": "Invalid token" }` |
| `403` | Forbidden | `{ "success": false, "message": "Role 'student' not authorized" }` |
| `404` | Not Found | `{ "success": false, "message": "Job not found" }` |
| `500` | Server Error | `{ "success": false, "message": "Neuron API unreachable" }` |

---

## Neuron Matcher API Integration

| hire.io Endpoint | → | Neuron API |
|------------------|---|------------|
| `PUT /students/:id/resume` | → | `POST {{NEURON_SERVER_API}}/upload/resume` |
| `POST /jobs` | → | `POST {{NEURON_SERVER_API}}/upload/jobs` |
| `GET /students/:id/match/jobs` | → | `GET {{NEURON_SERVER_API}}/match/jobs` |
| `GET /jobs/:id/match/candidates` | → | `GET {{NEURON_SERVER_API}}/match/candidates` |

> **Semantic Matching Powered by**: Sentence Transformers + Cosine Similarity  
> **No RAG** — Pure **Vector-Based Semantic Matching**

---

## Summary of Roles & Permissions

| Action | Student | Company | Admin |
|-------|--------|--------|-------|
| Register/Login (Traditional) | No | Yes | Yes |
| SSO Login | Yes | No | No |
| View Own Profile | Yes | Yes | Yes |
| Update Own Profile | Yes | Yes | Yes |
| Upload Resume | Yes | No | Yes |
| Get Job Matches | Yes | No | Yes |
| Post Job | No | Yes | Yes |
| Get Candidate Matches | No | Yes | Yes |
| Manage Users | No | No | Yes |
| View Analytics | No | No | Yes |

---

## API Base URL Configuration

```env
PORT=8000
NEURON_SERVER_API=http://localhost:8001
JWT_SECRET=your-secret-key
```

---

**hire.io — Intelligent, Semantic, Scalable Job Matching**  
*Powered by AI, Built for India*

---

> **Documentation Version**: 1.0  
> **Last Updated**: November 10, 2025  
> **Maintained by**: hire.io Backend Team

