import express from "express";
import { getMessages, editMessage, deleteMessage } from "../controllers/messageController.js";
import userAuth from "../middlewares/userAuthMiddleware.js";

const messageRouter = express.Router();

messageRouter.use(userAuth); // Protect routes

// Route: GET /api/messages/CHANNEL_ID?page=1&limit=20
messageRouter.get("/:channelId", getMessages);

messageRouter.put("/:messageId", editMessage);  
messageRouter.delete("/:messageId", deleteMessage);

export default messageRouter;