# ⚖️ CaseWise: Enterprise Attorney Case Management

CaseWise is a secure, full-stack legal operations platform designed to streamline case lifecycles, client relationships, and document workflows with structured access control and operational intelligence.

---

## 🖼 Application Screenshots

![Login](./screenshots/login.png)  
![Dashboard](./screenshots/dashboard1.png)  
![Dashboard](./screenshots/dashboard2.png)  
![Dashboard](./screenshots/dashboard3.png)  
![Case Details](./screenshots/cases.png)  
![Tasks](./screenshots/tasks.png)  
![Documents](./screenshots/documents.png)

---

## ✨ Key Capabilities

- **📁 Case Lifecycle Management** – End-to-end tracking of priority, status, case summaries, and legal deadlines.  
- **👥 Client CRM** – Centralized, searchable database linked across multiple legal matters.  
- **✅ Task Orchestration** – Case-linked tasks with automated overdue detection.  
- **📄 Secure Document Vault** – Case-based document tracking and secure uploads.  
- **📊 Executive Analytics** – Visual data insights into case distribution and firm productivity.  
- **🚨 Smart Attention Panel** – High-priority alerts for urgent deadlines and missing documentation.  
- **🧠 Risk Engine** – Rule-based automated case risk classification.  
- **🔍 Compliance Logging** – Full audit trails and role-based activity monitoring.

---

## 🛠️ Tech Stack & Development

This project was built using a modern full-stack architecture. To achieve rapid deployment and high code quality, **Cursor** and **ChatGPT** were utilized for accelerated development, component scaffolding, and logic optimization.

- **Frontend**: React.js, Tailwind CSS  
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB  
- **Tools**: Cursor (AI Code Editor), ChatGPT  

---

## 🔐 Roles & Access Control

- **Admin** → Full system access  
- **Attorney** → Full access to assigned cases  
- **Assistant** → *(Planned – see Future Scope)*  

All protected routes require:

```http
Authorization: Bearer <JWT>
```
---

## 🚀 Future Scope

- **👥 Assistant Integration** – Implement a third user tier for Legal Assistants to manage documentation and scheduling on behalf of Attorneys.
- **🖇️ Multi-User Case Assignment** – Enable assigning multiple Assistants and Attorneys to a single high-complexity case.
- **📅 Calendar Sync** – Integration with Outlook and Google Calendar for deadline tracking and automated reminders.
- **⚖️ AI Document Summarization** – Automated extraction of key insights and summaries from legal filings using AI models.
- **📊 Advanced Analytics Dashboard** – Predictive insights based on case trends and workload distribution.
- **🔔 Real-Time Notifications** – WebSocket-based live alerts for task updates, case changes, and document uploads.

---

## 🌱 Seed Data (Database Initialization)

The `seed/` folder contains scripts used to populate the database with initial sample data.

### Why It Was Used

- Quickly initialize the database with predefined users
- Insert sample clients and cases for testing
- Demonstrate application features without manual data entry
- Ensure consistent data structure during development and evaluation

### How to Run Seed Script (If Required)

Navigate to the backend folder:

```bash
cd backend
node seed/seed.js
```
## 🧩 Getting Started

Follow these steps to run the project locally.

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `backend/` with the following keys:
   ```dotenv
    MONGO_URI=<mongodb://user:pass@host:port/db>
    JWT_SECRET=<string used for jsonwebtoken>
    JWT_EXPIRES_IN=<token lifetime, e.g. "8h" or "2d">
    CLIENT_URL=http://localhost:5
   ```
4. Seed data (optional):
   ```bash
   npm run seed
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
   or for production:
   ```bash
   npm start
   ```

### Frontend Setup

1. Change to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `frontend/` containing:
   ```dotenv
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
   Adjust the URL if your backend runs elsewhere.
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🔧 Environment Variables Format

### Backend `.env`
```
MONGO_URI=<mongodb://user:pass@host:port/db>
JWT_SECRET=<string used for jsonwebtoken>
JWT_EXPIRES_IN=<token lifetime, e.g. "8h" or "2d">
CLIENT_URL=http://localhost:5173
PORT=<optional port number>
```
### Frontend `.env`
```
VITE_API_BASE_URL=<backend API base URL>
```

---

## 👨‍💻 Developer

Amogh Pai  
Full-Stack Developer | Backend & Systems Focused

