# LUNORA System Architecture

This document describes the architectural blueprints, database relationships, API routing lifecycles, and deployment mapping of the **LUNORA Premium E-Commerce Platform**.

---

## 🗺️ 1. Overall System Architecture

```mermaid
graph TD
    A["Next.js FrontEnd (Vercel)"] -->|HTTPS JSON Request| B["Express.js Server (Render)"]
    B -->|Mongoose DB Session| C["MongoDB Atlas Cluster"]
    B -->| direct Streaming upload| D["Cloudinary Image CDN"]
    B -->|SMTP mail Relay| E["Resend Mail Provider"]
    A -->|Live checkout Payment| F["Razorpay live Webhook/SDK"]
```

---

## 🔒 2. Authentication & Session Lifecycles

```mermaid
sequenceDiagram
    actor Client as Customer Browser
    participant API as Express API Server
    participant DB as MongoDB Atlas

    Client->>API: POST /api/v1/auth/login (email, password)
    API->>DB: Query User details
    DB-->>API: User Record (Bcrypt hashed)
    API->>API: Validate Password (bcrypt.compare)
    API->>API: Generate JWT token & CSRF Secret
    API-->>Client: Set HttpOnly Cookie (JWT) & non-HttpOnly Cookie (csrfToken)
    Note over Client,API: Subsequent requests require JWT Cookie + X-CSRF-Token Header
```

---

## 💳 3. Checkout & Atomic Concurrency Payments

```mermaid
sequenceDiagram
    actor Client as Storefront Checkout
    participant API as Express API Server
    participant DB as MongoDB Atlas
    participant RZP as Razorpay Gateway

    Client->>API: POST /api/v1/orders (address, cart details)
    API->>DB: Start Mongoose Transaction Session
    API->>DB: query Product Stock
    Note over API,DB: Atomic Stock decrement (findOneAndUpdate with stock >= quantity)
    alt Stock Available
        DB-->>API: Decrement Successful
        API->>RZP: Create Order ID (paise amount)
        RZP-->>API: Razorpay Order ID returned
        API->>DB: Create Order Record (Status: Pending)
        API->>DB: Commit Transaction & Clear Cart
        API-->>Client: Return Order ID to Client Checkout Overlay
    else Out of Stock
        DB-->>API: Decrement Fails (0 records matched)
        API->>DB: Abort Transaction
        API-->>Client: Return 400 Insufficient Stock Error
    end
```

---

## 🗄️ 4. Deployment Topology

```mermaid
graph LR
    A["storefront Vercel Edge Node"] -->|Global SSL DNS| B["client Customer Browser"]
    B -->|API HTTPS endpoint| C["Render backend Cluster Node"]
    C -->|Secure Connection String| D["MongoDB Atlas Replica Set"]
    C -->|API relays| E["Cloudinary edge CDN"]
    C -->|Relay pings| F["Resend SMTP Relay"]
```
