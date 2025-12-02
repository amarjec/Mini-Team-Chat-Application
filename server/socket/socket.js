// socket/socket.js
import { Server } from "socket.io";
import Message from "../models/messageModel.js"; // Import Message model to save to DB

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  // Store online users: Map<UserId, SocketId>
  let onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // 1. Add User (Presence)
    socket.on("add_user", (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit("get_users", Array.from(onlineUsers.keys()));
    });

    // 2. Join Channel
    socket.on("join_channel", (channelId) => {
      socket.join(channelId);
      console.log(`User ${socket.id} joined channel: ${channelId}`);
    });

    // --- TYPING INDICATORS ---
    socket.on("typing", (data) => {
      // Broadcast to everyone in the channel EXCEPT the sender
      socket.to(data.channel).emit("typing", data.username);
    });

    socket.on("stop_typing", (data) => {
      socket.to(data.channel).emit("stop_typing", data.username);
    });

    // 3. Send Message
    socket.on("send_message", async (data) => {
      // data: { sender, channel, content }
      
      // Save to Database (Requirement: Store every message)
      try {
        const newMessage = await Message.create(data);
        // Populate sender info so frontend can display name immediately
        await newMessage.populate("sender", "username");

        // Broadcast to channel
        io.to(data.channel).emit("receive_message", newMessage);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    // 4. Disconnect
    socket.on("disconnect", () => {
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit("get_users", Array.from(onlineUsers.keys()));
    });
  });

  return io;
};