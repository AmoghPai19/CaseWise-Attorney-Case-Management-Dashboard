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
npm run seed
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
3. Copy the example env file and fill in your own values:
   ```bash
   cp .env.example .env
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
3. Copy the example env file and adjust the API URL if needed:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🔧 Environment Variables

Both `backend/.env.example` and `frontend/.env.example` are checked into the repo — copy them to `.env` and fill in real values. Nothing should be committed to `.env` itself (it's git-ignored).

### Backend `.env`
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/casewise
CLIENT_URL=http://localhost:5173
JWT_SECRET=<a long random string>
JWT_EXPIRES_IN=8h
MAX_UPLOAD_SIZE_MB=20
```
### Frontend `.env`
```
VITE_API_URL=http://localhost:5000/api
```

---

## 👨‍💻 Developer

Amogh Pai  
Full-Stack Developer | Backend & Systems Focused

