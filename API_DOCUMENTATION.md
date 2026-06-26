# LUNORA Backend API Documentation (v1.0.0)

All requests expect JSON payload inputs (where applicable) and return JSON responses. Session management relies on an HTTPOnly JWT token cookie. State-changing endpoints also require a matching double-submit CSRF token cookie inside the `X-CSRF-Token` header.

---

## 🔐 1. Authentication Endpoints

### A. Customer Registration
* **Endpoint**: `POST /api/v1/auth/register`
* **Auth Requirement**: None
* **Payload (Zod Checked)**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "User registered successfully.",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "user": {
        "id": "6a3e8b8133f84822d01470fe",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "user"
      }
    }
  }
  ```

### B. Customer Login
* **Endpoint**: `POST /api/v1/auth/login`
* **Auth Requirement**: None
* **Payload**:
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123"
  }
  ```
* **Success Response (200 OK)**: Sets JWT token in cookie and returns user details.

---

## 🛍️ 2. Product Catalog Endpoints

### A. Fetch Products (Paginated & Filtered)
* **Endpoint**: `GET /api/v1/products`
* **Auth Requirement**: None
* **Query Parameters**:
  - `page`: Page index (default: `1`)
  - `limit`: Items per page (default: `10`)
  - `search`: Search term
  - `category`: Category slug filter
  - `price_min`/`price_max`: Price range limits
  - `sort`: `price_asc`, `price_desc`, `newest`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "count": 12,
    "pagination": { "total": 12, "page": 1, "limit": 12, "pages": 1 },
    "data": {
      "products": [
        {
          "id": "6a3e8afb7a47ceb5b00b46c8",
          "name": "Aria Pebble Leather Tote",
          "slug": "aria-pebble-leather-tote",
          "price": 3499,
          "stock": 25,
          "sku": "LUN-TST123",
          "images": [...]
        }
      ]
    }
  }
  ```

---

## 🛒 3. Cart & Checkout Endpoints

### A. Add Item to Cart
* **Endpoint**: `POST /api/v1/cart`
* **Auth Requirement**: Customer Cookie Session + CSRF Token Header
* **Payload**:
  ```json
  {
    "productId": "6a3e8afb7a47ceb5b00b46c8",
    "quantity": 1,
    "colorName": "Tan Brown",
    "colorHex": "#b07d62"
  }
  ```
* **Success Response (200 OK)**: Returns updated cart payload.

### B. Place Order (Checkout)
* **Endpoint**: `POST /api/v1/orders`
* **Auth Requirement**: Customer Cookie Session + CSRF Token Header
* **Payload**:
  ```json
  {
    "shippingAddress": {
      "name": "Jane Doe",
      "street": "123 Premium Way",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postalCode": "400001",
      "phone": "9876543210"
    },
    "paymentMethod": "COD",
    "couponCode": "WELCOME200"
  }
  ```
* **Success Response (201 Created)**: Returns calculated order summary:
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "Order placed successfully.",
    "data": {
      "order": {
        "orderNumber": "LUN-2026-119693",
        "subtotal": 8196,
        "discount": 200,
        "shipping": 0,
        "tax": 1439,
        "total": 9435,
        "paymentStatus": "Pending",
        "orderStatus": "Pending"
      }
    }
  }
  ```

---

## 💳 4. Payments API

### A. Verify Razorpay Signature
* **Endpoint**: `POST /api/v1/payments/verify`
* **Auth Requirement**: Customer Cookie Session + CSRF Token Header
* **Payload**:
  ```json
  {
    "razorpay_order_id": "order_mock_287320",
    "razorpay_payment_id": "pay_mock_424461",
    "razorpay_signature": "2d7a225d919683668db49952de2ab51f47f5dfad72a721b33ea7e08be6d27247"
  }
  ```
* **Success Response (201 Created)**: Returns verification confirmation status.

---

## 🏥 5. Health & Monitoring

### A. Readiness Probes
* **Endpoint**: `GET /api/ready`
* **Auth Requirement**: None
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "LUNORA is fully ready to accept client traffic.",
    "data": {
      "status": "ready",
      "checks": {
        "database": "ready",
        "cloudinary": "ready",
        "smtp": "ready"
      }
    }
  }
  ```
