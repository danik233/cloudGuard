# CloudGuard - Alert Management System

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Installation](#installation)
- [Running the System](#running-the-system)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)

---

## 🎯 Overview

**CloudGuard** is an AWS security alert management system. It detects anomalies, manages alerts, and allows users to track the status of each alert through its lifecycle.

### Key Features:
- ✅ Automatic alert creation from security findings
- ✅ Alert lifecycle management (New → Acknowledged → In-Progress → Resolved)
- ✅ Filter by severity, status, and category
- ✅ Complete audit logging system
- ✅ Intuitive user interface

---

## 🏗️ Architecture

The system consists of two main components:

### 1️⃣ Backend (Node.js + Express)
**Location:** `cloudguard/back/`

```
back/
├── server.js                 # Main server
├── models/
│   └── Alert.js             # Alert data model
├── repositories/
│   └── AlertRepository.js   # Database access layer
├── services/
│   ├── AlertManager.js      # Business logic
│   └── AuditLogManager.js   # Audit logging
├── controllers/
│   └── alertController.js   # HTTP request handlers
└── routes/
    └── alertRoutes.js       # API route definitions
```

**How the Backend Works:**
- **Server (port 3000)** receives HTTP requests
- **Routes** direct requests to appropriate controllers
- **Controllers** use services to process requests
- **Services (AlertManager)** contain business logic
- **Repository** handles data storage (currently in-memory)
- **Models** define data structure and validation rules

### 2️⃣ Frontend (HTML + CSS + JavaScript)
**Location:** `cloudguard/front/`

```
front/
├── index.html    # Main HTML page
├── styles.css    # All styling
└── app.js        # Frontend JavaScript logic
```

**How the Frontend Works:**
- **index.html** - User interface structure
- **styles.css** - Modern, responsive design
- **app.js** - Makes API calls to backend and updates UI

---

## 📦 Installation

### Prerequisites:
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Step-by-Step Installation:

1. **Clone or navigate to project directory:**
```bash
cd /path/to/cloudGuard
```

2. **Install dependencies:**
```bash
npm install
```

3. **Install dev tools for running both servers:**
```bash
npm install --save-dev concurrently http-server
```

4. **Verify your project structure:**
```
cloudguard/
├── back/          # Backend files
├── front/         # Frontend files
├── package.json   # Dependencies and scripts
└── .env          # Environment variables
```

---

## 🚀 Running the System

### Option 1: Run Both Backend & Frontend Together (Recommended)

```bash
npm start
```

This will start:
- ✅ **Backend** on `http://localhost:3000`
- ✅ **Frontend** on `http://localhost:8080` (opens automatically)

### Option 2: Development Mode (with auto-reload)

```bash
npm run dev
```

### Option 3: Run Separately

**Backend only:**
```bash
npm run backend-only
```

**Frontend only:**
```bash
npm run frontend-only
```

### Accessing the Application:

1. Open your browser
2. Go to: `http://localhost:8080`
3. The frontend will connect to the backend at `http://localhost:3000`

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. **Create Alert**
```http
POST /api/alerts
Content-Type: application/json

{
  "type": "anomaly",
  "severity": "High",
  "category": "S3",
  "description": "User performed 25 GetObject calls in 1 minute",
  "metadata": {
    "user": "test@example.com",
    "resource": "sensitive-bucket"
  }
}
```

**Response:**
```json
{
  "id": "uuid-here",
  "severity": "High",
  "category": "S3",
  "status": "New",
  "description": "User performed 25 GetObject calls in 1 minute",
  "metadata": {...},
  "createdAt": "2025-01-14T10:30:00.000Z",
  "updatedAt": "2025-01-14T10:30:00.000Z"
}
```

#### 2. **Get All Alerts**
```http
GET /api/alerts
```

**With filters:**
```http
GET /api/alerts?severity=High&status=New&category=S3
```

**Response:**
```json
[
  {
    "id": "uuid-1",
    "severity": "High",
    "category": "S3",
    "status": "New",
    "description": "...",
    "createdAt": "...",
    "updatedAt": "..."
  },
  ...
]
```

#### 3. **Get Single Alert**
```http
GET /api/alerts/:id
```

#### 4. **Update Alert Status**
```http
PUT /api/alerts/:id/status
Content-Type: application/json

{
  "status": "Acknowledged"
}
```

**Valid status transitions:**
- `New` → `Acknowledged` or `Resolved`
- `Acknowledged` → `In-Progress` or `Resolved`
- `In-Progress` → `Resolved`
- `Resolved` → (no transitions)

#### 5. **Get Audit Logs**
```http
GET /api/audit-logs
```

**With filters:**
```http
GET /api/audit-logs?action=CREATE_ALERT&alertId=uuid-here
```

---

## 📁 Project Structure

```
cloudguard/
├── back/                           # Backend (Node.js)
│   ├── server.js                   # Main server entry point
│   ├── models/
│   │   └── Alert.js                # Alert model with validation
│   ├── repositories/
│   │   └── AlertRepository.js      # Data access (in-memory storage)
│   ├── services/
│   │   ├── AlertManager.js         # Business logic for alerts
│   │   └── AuditLogManager.js      # Audit logging service
│   ├── controllers/
│   │   └── alertController.js      # HTTP request handlers
│   └── routes/
│       └── alertRoutes.js          # API route definitions
│
├── front/                          # Frontend (HTML/CSS/JS)
│   ├── index.html                  # Main page
│   ├── styles.css                  # All styling
│   └── app.js                      # Frontend logic
│
├── package.json                    # Project dependencies
├── .env                           # Environment variables
└── README.md                      # This file
```

---

## 🔄 How It Works

### Data Flow:

```
User clicks button in UI (Frontend)
         ↓
JavaScript makes HTTP request to API
         ↓
Backend receives request at http://localhost:3000/api
         ↓
Routes direct to appropriate Controller
         ↓
Controller calls AlertManager (Service)
         ↓
AlertManager processes business logic
         ↓
AlertRepository stores/retrieves data
         ↓
AuditLogManager logs the action
         ↓
Response sent back to Frontend
         ↓
UI updates with new data
```

### Example: Creating an Alert

1. **User clicks** "Create Test Alert" button
2. **Frontend** (`app.js`) sends POST request:
   ```javascript
   fetch('http://localhost:3000/api/alerts', {
     method: 'POST',
     body: JSON.stringify(finding)
   })
   ```
3. **Backend** receives request at `/api/alerts`
4. **alertRoutes.js** routes to `alertController.createAlert()`
5. **alertController** calls `alertManager.createAlert(finding)`
6. **AlertManager** validates and creates Alert object
7. **AlertRepository** stores alert in memory
8. **AuditLogManager** logs "CREATE_ALERT" action
9. **Response** sent back with alert data
10. **Frontend** displays new alert in the list

### Where is the API?

The API is **created by the Backend**:

- **Backend code** (`back/server.js`) starts an Express server on port 3000
- **Routes** (`back/routes/alertRoutes.js`) define API endpoints
- **Controllers** (`back/controllers/alertController.js`) handle requests
- **Services** (`back/services/AlertManager.js`) contain the business logic

The API runs at: `http://localhost:3000/api`

---

## 🧪 Testing the API

### Using curl:

**Create an alert:**
```bash
curl -X POST http://localhost:3000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "type": "anomaly",
    "severity": "High",
    "category": "S3",
    "description": "Unusual S3 access detected"
  }'
```

**Get all alerts:**
```bash
curl http://localhost:3000/api/alerts
```

**Update alert status:**
```bash
curl -X PUT http://localhost:3000/api/alerts/{ALERT_ID}/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Acknowledged"}'
```

### Using the Frontend:

1. Open `http://localhost:8080`
2. Click "Create Test Alert" button
3. Use filters to find specific alerts
4. Click action buttons to change alert status

---

## 🎨 Frontend Features

- **Dashboard** - View all alerts at a glance
- **Filters** - Filter by severity, status, and category
- **Alert Cards** - Color-coded by severity with status badges
- **Actions** - Update alert status with valid transitions
- **Test Alert** - Create sample alerts for testing
- **Responsive** - Works on desktop and mobile

---

## 🔐 Security & Validation

- ✅ Alert status transitions are validated
- ✅ Only valid severities: High, Medium, Low
- ✅ Only valid categories: IAM, S3, Network, Activity, CVE
- ✅ Only valid statuses: New, Acknowledged, In-Progress, Resolved
- ✅ All actions are logged in audit trail
- ✅ Input validation on both frontend and backend

---

## 🛠️ Troubleshooting

### Backend won't start:
```bash
# Make sure you're in the right directory
cd /path/to/cloudGuard

# Install dependencies
npm install

# Check if port 3000 is available
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows
```

### Frontend can't connect to backend:
- Make sure backend is running on port 3000
- Check that `app.js` has correct API URL: `http://localhost:3000/api`
- Check browser console for errors (F12 → Console tab)

### CORS errors:
- The backend has CORS enabled by default
- If you see CORS errors, make sure backend is running

---

## 📝 Development Notes

### Current Implementation:
- ✅ In-memory storage (data resets on server restart)
- ✅ RESTful API design
- ✅ Clean architecture (MVC pattern)
- ✅ Audit logging

### Future Enhancements:
- 🔄 MongoDB integration for persistent storage
- 🔄 Authentication & Authorization
- 🔄 Real-time notifications (WebSocket)
- 🔄 Email/Slack integration
- 🔄 Advanced analytics dashboard

---

## 📞 Support

For questions or issues:
1. Check the troubleshooting section
2. Review API documentation
3. Check browser console for frontend errors
4. Check terminal for backend errors

---

## 📄 License

This project is part of the Software Engineering Methods course assignment.

---

**Created by:** Group 12
**Course:** Software Engineering Methods
**Project:** CloudGuard - AWS Anomaly & Data Protection System