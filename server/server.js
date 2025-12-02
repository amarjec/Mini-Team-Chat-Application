import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/mongoDB.js"; // Import DB connection
import { initSocket } from "./socket/socket.js"; // Import Socket logic
import userRoute from "./routes/userRoute.js"; // Import User Routes
import channelRoute from "./routes/channelRoute.js"; // Import Channel Routes
import messageRoute from "./routes/messageRoute.js"; // Import Message Routes

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 8000;

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigin = ['http://localhost:5173', 'https://mini-team-chat-app.onrender.com'];

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(cors({
  origin: allowedOrigin, 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

// Initialize Socket.io
const io = initSocket(server); 

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/auth", userRoute);
app.use("/api/channels", channelRoute); 
app.use("/api/messages", messageRoute);

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
