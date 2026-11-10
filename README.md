# TaskFlow — Full Stack Task Management System

TaskFlow is a production-grade, Full Stack Task Management System developed as a college Full Stack Development (FSD) project. Built using **React + Vite + Tailwind CSS + Node.js + Express.js + MongoDB + Mongoose + JWT Authentication + Socket.IO**.

---

## 🚀 Key Features

### 1. Dashboard & Task Management
- **Interactive Dashboard**: Real-time statistics counters for Total Tasks, Pending, In Progress, and Completed tasks.
- **Full Task CRUD**: Create, view, search, filter, update status, and delete tasks with persistent storage.
- **Search & Multi-Filter**: Live instant search across task titles and descriptions, filter by status (`Pending`, `In Progress`, `Completed`), and priority levels (`Low`, `Medium`, `High`).

### 2. Multi-Project Management
- **Project Workspaces**: Group tasks under specific projects with visual progress bars and status indicators.

### 3. JWT Authentication & Role-Based Access Control (RBAC)
- **Secure Registration & Login**: Passwords hashed using `bcrypt` (12 salt rounds); JWT token-based authentication.
- **Role Separation**:
  - `user`: Manage personal and assigned tasks via **My Tasks** view.
  - `admin`: Full administrative access via **Admin Dashboard** to oversee all tasks, adjust workflows, and inspect registered users and roles.
- **Route Protection**: Client-side route guards (`ProtectedRoute.jsx`) combined with backend middleware (`protect`, `adminOnly`) enforcing security boundaries.

### 4. Real-Time Notifications (Socket.IO)
- **Live Event Broadcasting**: Instant notifications sent across clients on `task:created`, `task:updated`, and `task:deleted` without needing to reload the browser.
- **Notification Bell**: Navbar dropdown with live connection indicator, unread counter badge, timestamped activity feed, and clear-all capability.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router v7 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas / Local MongoDB, Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt.js |
| **Real-Time** | Socket.IO (Server & Client) |
| **Testing** | Automated Integration Test Suite (`test-runner.js`) |

---

## 📁 Project Directory Structure

```text
task-management-system/
├── client/                      # React Frontend
│   ├── public/                  # Public assets & icons
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Navbar.jsx           # Responsive navbar with NotificationBell & Auth
│   │   │   ├── NotificationBell.jsx # Real-time Socket.IO notification dropdown
│   │   │   ├── ProtectedRoute.jsx   # Client-side route protection
│   │   │   ├── StatsCard.jsx        # Dashboard metric cards
│   │   │   ├── TaskCard.jsx         # Task item display with actions
│   │   │   ├── TaskForm.jsx         # Task creation modal/form
│   │   │   └── loading.jsx          # Loading spinner
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # JWT Auth provider & session persistence
│   │   ├── hooks/
│   │   │   └── useAuth.js           # Custom authentication hook
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Main dashboard with live stats & task cards
│   │   │   ├── Tasks.jsx            # Search, filter, and task management
│   │   │   ├── MyTasks.jsx          # Authenticated user's assigned tasks
│   │   │   ├── Projects.jsx         # Project management page
│   │   │   ├── Notifications.jsx    # Real-time notification feed
│   │   │   ├── Login.jsx            # JWT Login with role redirect
│   │   │   ├── Register.jsx         # User registration
│   │   │   └── AdminDashboard.jsx   # Administrative control panel
│   │   ├── services/
│   │   │   └── api.js               # Centralized API service with Bearer auth
│   │   ├── app.jsx                  # Main application routes
│   │   ├── main.js                  # Entry point (React.createElement)
│   │   └── index.css                # Tailwind CSS imports
│   ├── vite.config.js           # Vite dev server with /api proxy
│   └── package.json
│
├── server/                      # Express Backend & Socket.IO
│   ├── config/
│   │   └── db.js                # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js    # Register, login, me, user management
│   │   ├── taskController.js    # Task CRUD + Socket.IO emitters
│   │   └── projectController.js # Project CRUD
│   ├── middleware/
│   │   ├── authMiddleware.js    # Token verification & admin authorization
│   │   └── errorMiddleware.js   # 404 notFound & centralized errorHandler
│   ├── models/
│   │   ├── User.js              # User model (name, email, password hash, role)
│   │   ├── Task.js              # Task model (title, priority, status, dueDate, refs)
│   │   └── Project.js           # Project model
│   ├── routes/
│   │   ├── authRoutes.js        # /api/auth routes
│   │   ├── taskRoutes.js        # /api/tasks routes
│   │   └── projectRoutes.js     # /api/projects routes
│   ├── utils/
│   │   └── generateToken.js     # JWT generator
│   ├── seed.js                  # Database seeder (Admin, User, Projects, Tasks)
│   ├── test-runner.js           # Automated integration test suite
│   ├── server.js                # Express & Socket.IO entry point
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local MongoDB installed OR a free MongoDB Atlas connection string)

### 2. Configure Environment Variables

**Backend (`server/.env`)**:
```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
JWT_SECRET=0995363b9dc351a63ef9ac11e313b5efb6e59feefebf882e76d1d4e67ee1f0352a691210cd9ef58f7f44f0a5e5b6a1e7059479d6190e18ce8b00b0d08f0e2a5a
JWT_EXPIRES_IN=7d
ADMIN_SECRET=taskflow_admin_secret_key_2026
```
*(If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string).*

**Frontend (`client/.env`)**:
```env
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Install Dependencies
```bash
# In the client directory
cd client
npm install

# In the server directory
cd ../server
npm install
```

### 4. (Optional) Seed the Database
Populate the database with sample tasks, projects, an admin account, and a normal user:
```bash
cd server
npm run seed
```
**Default Seed Credentials**:
- **Admin**: `admin@taskflow.com` / `AdminPass123`
- **User**: `divya@taskflow.com` / `UserPass123`

### 5. Run the Application
Open two separate terminals:

**Terminal 1 — Backend**:
```bash
cd server
npm run dev
```
*Server runs at `http://localhost:5000`.*

**Terminal 2 — Frontend**:
```bash
cd client
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

---

## 🧪 Testing & Verification

Run the automated integration test suite from the `server` directory:
```bash
cd server
npm test
```
The test suite automatically tests:
- Server health and root endpoints (`GET /`, `GET /api/health`)
- User registration, password validation, duplicate email handling
- JWT login and profile retrieval (`GET /api/auth/me`)
- Task CRUD operations, authorization checks, and statistics calculation
- Socket.IO connection and real-time event broadcasting

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Login with email & password |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `GET` | `/api/auth/users` | Admin | Retrieve all users |
| `GET` | `/api/tasks` | Public / User | List all tasks with search/filter |
| `GET` | `/api/tasks/stats/summary` | Public | Dashboard task metrics |
| `GET` | `/api/tasks/:id` | Public | Get single task by ID |
| `POST` | `/api/tasks` | Authenticated | Create a new task (emits `task:created`) |
| `PUT` | `/api/tasks/:id` | Authenticated | Update task status/fields (emits `task:updated`) |
| `DELETE` | `/api/tasks/:id` | Authenticated | Delete task (emits `task:deleted`) |
| `GET` | `/api/projects` | Public | List all projects |
| `POST` | `/api/projects` | Authenticated | Create a project |

---

## 👤 Author
**Divya Dhameja**  
College Full Stack Development (FSD) Project
