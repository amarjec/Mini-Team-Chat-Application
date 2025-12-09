# Mini Team Chat Application (Slack-like)

A full-stack, real-time collaboration tool allowing users to communicate via public and private channels. Built with the MERN stack and Socket.io.

## 🚀 Features

### Core Features
* **User Authentication:** Secure Signup/Login using JWT stored in HTTP-Only Cookies.
* **Real-time Messaging:** Instant message delivery using Socket.io.
* **Channels:** Create public channels, join existing ones, and view member counts.
* **Presence System:** Real-time "Online/Offline" status indicators for users.
* **Message History:** Messages are persisted in MongoDB and loaded upon joining a channel.
* **Responsive UI:** Fully responsive 3-column layout (Mobile, Tablet, Desktop).

### 🌟 Bonus Features (Implemented)
* **Private Channels:** Channels that are invisible to non-members and require an invite (via Email).
* **Typing Indicators:** Real-time "... is typing" notifications.
* **Message Editing & Deleting:** Users can edit or soft-delete their own messages.
* **Message Search:** Server-side search functionality to filter messages by content.

---

## 🛠️ Tech Stack

* **Frontend:** React (Vite), Tailwind CSS, Axios, React Router, React Icons.
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB (Mongoose ODM).
* **Real-time:** Socket.io (WebSockets).
* **Authentication:** JWT (JSON Web Tokens), Bcrypt.js, Cookie-Parser.

---

## ⚙️ Setup & Run Instructions

### Prerequisites
* Node.js installed on your machine.
* A MongoDB connection string (local or MongoDB Atlas).

### 1. Backend Setup
1.  Navigate to the server folder:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `server` root and add your credentials:
    ```env
    PORT=8000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_key
    CLIENT_URL=http://localhost:5173
    ```
4.  Start the backend server:
    ```bash
    npm run dev
    ```
    *The server should run on http://localhost:8000*

### 2. Frontend Setup
1.  Open a new terminal and navigate to the frontend folder:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open your browser and visit `http://localhost:5173`.

---

## ⚠️ Assumptions & Limitations

1.  **Unique Emails:** The system assumes every user registers with a unique email address.
2.  **Soft Deletes:** When a message is deleted, it is marked as "deleted" in the database but not removed physically, to maintain thread continuity (similar to WhatsApp).
3.  **Private Channels:** Currently, only existing members can add new members to a private channel via email. There is no "Request to Join" feature yet.
4.  **Notifications:** Push notifications are not implemented; users must be online (or have the app open) to see new activity immediately.

---

## 👤 Author
**Amar Agrawal**
* **Enrollment:** 0201MT221008
* **Submission for:** Full-Stack Internship Assignment
