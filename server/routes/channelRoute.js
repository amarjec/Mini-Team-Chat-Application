import express from "express";
import { createChannel, getChannels, joinChannel, leaveChannel, addMember } from "../controllers/channelController.js";
import userAuth from "../middlewares/userAuthMiddleware.js"; 

const channelRouter = express.Router();

// Apply middleware to all routes below
// Requirement: User authentication needed [cite: 9]
channelRouter.use(userAuth); 

channelRouter.post("/create", createChannel);
channelRouter.get("/", getChannels);
channelRouter.put("/:channelId/join", joinChannel);
channelRouter.put("/:channelId/leave", leaveChannel);
channelRouter.put("/:channelId/add_member", addMember);

export default channelRouter;