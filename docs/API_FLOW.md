# LUNORA API Request-Response Lifecycle Flow

This document details the middleware pipeline and execution lifecycles for requests reaching the **LUNORA** Express backend API.

---

## ⚙️ 1. Pipeline Execution Order

```mermaid
graph TD
    A["Incoming HTTP Request"] --> B["Helmet Security Headers"]
    B --> C["CORS Origin Filter"]
    C --> D["Rate Limiter (global/auth/contact)"]
    D --> E["Cookie Parser"]
    E --> F["JWT Authenticator (Session check)"]
    F --> G["CSRF Protection Guard"]
    G --> H["Zod Request Validator"]
    H --> I["Controller Handler"]
    I -->|Mongoose Transaction| J["Database Write/Read"]
    J --> K["Success Response (JSON)"]
    I -->|Throw AppError| L["Global Error Middleware"]
    L --> M["Formatted Error Response (JSON)"]
```

---

## 🔒 2. Authentication & Authorization Guard

The backend exposes a `protect` middleware which:
1. Resolves token strings from `req.cookies.token` or checks headers for `Bearer <token>`.
2. Verifies the token using `jsonwebtoken` against `JWT_SECRET`.
3. Queries Mongoose `User.findById(decoded.id)`. If the user has changed passwords since issuance, rejects the session.
4. Mounts user metadata to `req.user`.

For administrative endpoints, an `restrictTo("admin")` middleware runs immediately after, verifying `req.user.role === "admin"`.

---

## 🛡️ 3. Double-Submit CSRF Checks Flowchart

```mermaid
graph TD
    A["State Changing Request (POST/PATCH/DELETE)"] --> B{"Session Cookie Auth Active?"}
    B -->|No: Header Bearer Auth| C["Bypass CSRF validation"]
    B -->|Yes: Cookie Authenticated| D{"X-CSRF-Token Header Present?"}
    D -->|No| E["Reject: 403 Missing Header"]
    D -->|Yes| F{"Header Token Matches csrfToken Cookie?"}
    F -->|No| G["Reject: 403 Token Mismatch"]
    F -->|Yes| H["Proceed to Zod Validators"]
```
