# Payflow — Payment Processing & Daily Payout System

A mock payment aggregator service that handles merchant payments, commission logic (A, B, C), temporary hold (D), status transitions, and daily payouts with FIFO + balance validation.

---

# 🚀 Features

- Merchant registration with commission `C%`
- System-wide config (A, B%, D%)
- Register incoming payments
- Full status lifecycle:
    - ACCEPTED → PROCESSED → COMPLETED → PAID (or PAID_PENDING → PAID)
- Daily payout engine (FIFO + COMPLETED priority)
- API for manual status management
- CRUD for payments
- Swagger documentation
- Cron automation for processing
- Separate storage layers (Mongo + MySQL)

---

# 🧩 Payment Status Flow

### `1. ACCEPTED`
Initial state when payment is created.

### `2. PROCESSED`
Business rule:
```
available = amount - A - B - C - D
holdD     = D
```

### `3. COMPLETED`
D is unlocked:
```
available = amount - A - B - C
holdD     = 0
```

### `4. PAID_PENDING`
Payment was paid from PROCESSED (D still frozen).

### `5. PAID`
Final confirmation after D unlock.

      ┌────────────────────┐
      │      ACCEPTED       │
      └──────────┬──────────┘
                 │
                 │ processAccepted()
                 ▼
      ┌────────────────────┐
      │      PROCESSED     │
      │ available = A-B-C-D │
      │ holdD > 0           │
      └───────┬───────┬────┘
              │       │
              │       │ daily payout (если хватает средств)
              │       ▼
              │   ┌──────────────────────┐
              │   │    PAID_PENDING      │
              │   │  (выплачено A-B-C)   │
              │   │  holdD остаётся      │
              │   └───────────┬──────────┘
              │               │
              │               │ processProcessed()
              ▼               │
      ┌────────────────────┐  │
      │     COMPLETED      │  │
      │ available=A-B-C    │  │
      │ holdD = 0          │  │
      └──────────┬─────────┘  │
                 │            │
                 │ daily payout│
                 ▼            ▼
      ┌──────────────────┐  ┌──────────────────┐
      │       PAID       │  │       PAID       │
      │ (полностью        │  │ (holdD обнулён) │
      │   выплачено)      │  │                 │
      └──────────────────┘  └──────────────────┘

---

# 🧱 Extended Tech Stack

## 🟦 Backend Core
- **NestJS** — modular backend framework
- **TypeScript** — strong typing
- **Node.js 18+** — runtime

## 🟩 Databases
- **MySQL** — stores *payments* (the financial ledger)
- **MongoDB** — stores *merchants* & configuration
- **Redis** — cache / future throttling / future locking

## 🐇 Messaging / Queueing
- **RabbitMQ**  
  Used for dispatching:
    - processAccepted jobs
    - processProcessed jobs
    - dailyPayout jobs  
      Ensures:
    - safe asynchronous processing
    - ability to scale workers
    - avoids blocking cron jobs

## 📊 Monitoring
- **Prometheus** — collects metrics
- **Grafana** — dashboards & visualisation

## 🐳 Deployment
- **Docker / Docker Compose** — convenient local deployment & service orchestration

## 📘 Documentation
- **Swagger (OpenAPI)** — interactive REST API documentation

---

# 🖧 System Components & Purpose

| Component | Purpose |
|----------|---------|
| **PaymentsService** | Full logic for payment CRUD, status changes, payout selection |
| **PayoutsService** | Main business logic: ACCEPTED→PROCESSED, PROCESSED→COMPLETED, daily payouts |
| **SystemConfigService** | Stores & applies A, B%, D% configuration |
| **MerchantsService** | Stores merchant data & commission `C%` |
| **RabbitMQ Consumers** | Automatically run status transitions |
| **Cron Jobs** | Triggers worker pipelines every few seconds or once per day |
| **MySQL Storage** | Ledger-like, immutable financial records |
| **MongoDB Storage** | Flexible structure for merchants and global config |
| **Prometheus Metrics** | Tracks uptime, cron runs, payout statistics |
| **Grafana** | Displays monitoring dashboards |

---

# 🔁 Full Application Flow

### 1. Incoming Payment → `ACCEPTED`
User or integration creates payment.

### 2. Cron: `ACCEPTED → PROCESSED`
Formula:
```
available = amount - A - B - C - D
holdD = D
```

### 3. Cron: `PROCESSED → COMPLETED`
Unlock D:
```
available += holdD
holdD = 0
```

### 4. Daily payout
Algorithm:
1. Load PROCESSED + COMPLETED
2. Sort by:
    - COMPLETED first
    - Then PROCESSED
    - FIFO inside status
3. Calculate `totalAvailable = Σ available`
4. Try to include payment if:
```
currentTotal + payoutAmount <= totalAvailable
```
5. Status transitions:
    - COMPLETED → PAID
    - PROCESSED → PAID_PENDING

### 5. Cron: `PAID_PENDING → PAID`
After COMPLETED stage unlocks D.

---

# 🧰 Installation

```
1 build & run containers:
docker compose -f docker-compose.dev.yml up --build

2 run migrations:
docker exec -it payflow-api-dev npm run mig:run
```

---

# 🧰 Environment Variables

```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=payflow

MONGO_URI=mongodb://localhost:27017/payflow

REDIS_HOST=localhost
REDIS_PORT=6379

RABBITMQ_URI=amqp://admin:admin@localhost:5672

PORT=3000
```

---

# ▶️ Run the App

### Development:
```
npm run start:dev
```

### Production:
```
npm run build
npm run start:prod
```

### Docker:
```
docker-compose up --build
```

---

# 📘 Swagger UI
```
http://localhost:3000/api
```

---

# 🔥 API Overview

## Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments` | Create payment |
| GET | `/payments/:id` | Retrieve payment |
| PATCH | `/payments/:id` | Update payment |
| DELETE | `/payments/:id` | Remove payment |
| POST | `/payments/status` | Update status |

## Payouts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payouts/process-accepted/:merchantId` | ACCEPTED→PROCESSED |
| POST | `/payouts/process-processed/:merchantId` | PROCESSED→COMPLETED, PENDING→PAID |
| POST | `/payouts/daily/:merchantId` | Daily payout |

---

# 📂 Project Structure

```
src/
 ├── payments/
 │    ├── api/
 │    ├── application/
 │    ├── domain/
 │    ├── dto/
 │    └── enums/
 │
 ├── payouts/
 │    ├── api/
 │    ├── application/
 │    └── dto/
 │
 ├── merchants/
 │    ├── api/
 │    ├── application/
 │    └── infrastructure/
 │
 ├── system-config/
 │    ├── api/
 │    ├── application/
 │    └── infrastructure/
 │
 ├── common/
 │    ├── dto/
 │    ├── database/
 │    └── utils/
 │
 └── main.ts
```

# 📡 Monitoring & Developer Tools

A complete set of tools for observing, debugging, and monitoring the payment system.

---

## 🐇 **RabbitMQ — Queue Management**
**URL:** http://localhost:15672/#/queues

Used for:
- processing queues (`ACCEPTED → PROCESSED`, `PROCESSED → COMPLETED`)
- dispatching daily payout tasks
- ensuring reliable asynchronous pipelines

Dashboard shows:
- queue depths
- consumers
- message rates
- latency

---

## 📊 **Grafana — Dashboards & Visualization**
**URL:** http://localhost:3000/

Used for:
- visualizing Prometheus metrics
- creating dashboards
- monitoring cron executions
- tracking payouts, queues, and system load

Typical dashboards:
- processed payments
- payout success rate
- RabbitMQ queue size
- CPU/RAM/IO metrics

---

## 📝 **Swagger — REST API Documentation**
**URL:** http://localhost:8080/api/docs#/

Provides:
- fully interactive REST API
- ability to test endpoints in the browser
- clear documentation for DTOs, responses and error formats

Updated automatically from code annotations.

---

## 🧠 **Redis Commander — Cache Browser**
**URL:** http://localhost:8081/

Used for:
- viewing Redis keys
- debugging cached values
- clearing cache manually

Useful for:
- rate limiting
- distributed locks
- future throttling mechanisms

---

## 📈 **Prometheus — Metrics Collector**
**URL:** http://localhost:9090/query

Collects:
- system metrics
- cron metrics
- payout statistics
- RabbitMQ metrics (via exporter)

Supports PromQL queries such as:
```
sum(payouts_total)
rate(http_requests_total[5m])
max(payment_processing_seconds)
```

---

# 🔍 Summary Table

| Service | Purpose | URL |
|--------|----------|------|
| 🐇 RabbitMQ | queue processing & async tasks | http://localhost:15672/#/queues |
| 📊 Grafana | dashboards & visualization | http://localhost:3000/ |
| 📝 Swagger | API documentation | http://localhost:8080/api/docs#/ |
| 🧠 Redis Commander | Redis cache browser | http://localhost:8081/ |
| 📈 Prometheus | metrics collection | http://localhost:9090/query |

---

Let me know if you want a **GitHub badge panel**, **icons with logos**, or a **dark-theme Markdown version**!  
I can also merge this block directly into your full README.
