# 🚨 ResQNet — AI-Powered Disaster Management System

<div align="center">

![ResQNet Banner](https://img.shields.io/badge/ResQNet-Disaster%20Management-red?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6Ii8+PC9zdmc+)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

**A full-stack disaster management and emergency response system built for hackathons and real-world use.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Reference](#-api-reference) • [Team](#-team)

</div>

---

## 📌 Problem Statement

During natural disasters, the biggest challenge is **organizing rescue operations efficiently**. Victims can't reach help easily, volunteers don't know where to go first, and NGOs don't know where aid is needed most. ResQNet solves this by creating a unified platform where every stakeholder — victims, volunteers, NGOs, and administrators — can coordinate in real time.

---

## ✨ Features

### 🆘 For Victims
- Emergency registration form with name, phone, email, location, and injury details
- Automatic **priority score calculation** based on severity and urgency
- Real-time rescue status tracker with ticket ID
- Step-by-step status updates: Submitted → Reviewing → Assigned → Dispatched

### ⛑️ For Volunteers
- Registration with skills, specialization, and availability
- Priority-sorted task queue — highest-score locations first
- Sequential task unlock system (complete Task 1 to unlock Task 2)
- Live dashboard with Leaflet map showing all active incidents

### 🏛️ For NGOs
- Organization registration with capacity and past experience
- Aid offer submission (food, shelter, medical, rescue, etc.)
- Live dashboard access with incident overview

### 🛡️ For Admins
- Secure login with email + password + 6-digit admin code
- Full dashboard with live MongoDB stats
- Assign volunteers to victims directly from the panel
- Priority-sorted victim list updated in real time

### 🗺️ Dashboard (Volunteer / NGO / Admin only)
- **Leaflet.js map** with color-coded incident markers (red = critical, amber = high, green = medium)
- Real-time incident sidebar sorted by priority score
- Submit new incident reports from the dashboard
- Live stats ticker (active incidents, critical count, affected people)
- Socket.io powered real-time updates

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend (Landing + Roles) | HTML5, CSS3, Vanilla JavaScript, Leaflet.js |
| Frontend (Dashboard) | React.js, CSS Modules, Leaflet.js |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Real-time | Socket.io |
| Authentication | JWT (JSON Web Tokens) + bcryptjs |
| Fonts | Bebas Neue, DM Sans, Space Mono |

---

## 📁 Project Structure

```
ResQNet/
│
├── resqnet.html                    # Landing page + all role portals (standalone)
│
├── Disaster Management/            # React dashboard (Volunteer / NGO / Admin)
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.jsx
│       ├── App.module.css
│       ├── index.js
│       ├── index.css
│       ├── utils/
│       │   └── priority.js         # Priority scoring algorithm
│       ├── hooks/
│       │   └── useReports.js       # State management + API calls
│       └── components/
│           ├── Topbar.jsx
│           ├── Sidebar.jsx
│           ├── MapView.jsx         # Leaflet map integration
│           ├── ReportForm.jsx
│           ├── Chatbot.jsx         # AI response assistant
│           ├── Toast.jsx
│           ├── VictimPortal.jsx
│           ├── VictimLogin.jsx
│           └── VictimRegister.jsx
│
└── backend/                        # Node.js REST API
    ├── server.js                   # Express + Socket.io entry point
    ├── package.json
    ├── .env                        # Environment variables
    ├── config/
    │   └── db.js                   # MongoDB connection
    ├── middleware/
    │   ├── auth.js                 # JWT + role-based access
    │   └── priority.js             # Scoring formula
    ├── models/
    │   ├── Victim.js
    │   ├── Volunteer.js
    │   ├── NGO.js
    │   └── Incident.js
    └── routes/
        ├── victims.js              # /api/victims
        ├── volunteers.js           # /api/volunteers
        ├── ngos.js                 # /api/ngos
        ├── incidents.js            # /api/incidents
        └── admin.js                # /api/admin
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- [MongoDB](https://www.mongodb.com/try/download/community) (local installation)
- npm or yarn

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/Khushbu677/Disaster_Management.git
cd Disaster_Management
```

**2. Set up the backend**
```bash
cd backend
npm install
```

**3. Configure environment variables**

Create/edit the `.env` file inside `backend/`
```
```

**4. Set up the React dashboard**
```bash
cd "Disaster Management"
npm install
```

### Running the Project

Open **3 terminals** simultaneously:

```bash
# Terminal 1 — Start MongoDB
mongod

# Terminal 2 — Start backend API (http://localhost:5000)
cd backend
npm run dev

# Terminal 3 — Start React dashboard (http://localhost:3000)
cd "Disaster Management"
npm start
```

Then open `resqnet.html` directly in your browser — no server needed.

---

## 🔄 User Flow

```
resqnet.html (Landing Page)
        │
        ├── 🆘 VICTIM ──────► Registration Form ──► Status Tracker (NO dashboard access)
        │
        ├── ⛑️ VOLUNTEER ───► Registration Form ──► Dashboard + Map + Task Queue
        │
        ├── 🏛️ NGO ─────────► Registration Form ──► Dashboard + Map + Aid Offer Form
        │
        └── 🛡️ ADMIN ────────► Secure Login ───────► Dashboard + Map + Admin Panel
```

> **Role-based access control:** Victims are completely blocked from the command dashboard. Only Volunteers, NGOs, and Admins can see the live map and incident data.

---
---

## 👩‍💻 My Contribution

- Built the React.js frontend
- Designed dashboards and UI components
- Implemented the SOS priority scoring algorithm
- Developed emergency request ranking logic
- Integrated frontend with backend APIs

## 🔒 Security

- Passwords are hashed using **bcryptjs** before storing in MongoDB
- All dashboard routes protected by **JWT tokens**
- **Role-based middleware** blocks victims from accessing rescue command data
- Admin login requires email + password + 6-digit security code

---

## 📄 License

This project was built for a hackathon. Feel free to use, modify, and improve.

---

<div align="center">

*Every second counts in a disaster. ResQNet makes those seconds count.*

</div>
