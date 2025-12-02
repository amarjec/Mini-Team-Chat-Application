import Channel from "../models/channelModel.js";
import User from "../models/userModel.js";

// @desc    Create a new channel
// @route   POST /api/channels
export const createChannel = async (req, res) => {
  try {
    // 1. Accept 'type' from body
    const { name, description, type } = req.body; 

    const newChannel = new Channel({
      name,
      description,
      type: type || "public", // Default to public
      members: [req.userId],
      createdBy: req.userId,
    });

    const savedChannel = await newChannel.save();
    const populatedChannel = await savedChannel.populate("members", "username avatar");

    req.io.emit("new_channel", populatedChannel);
    res.status(201).json(populatedChannel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all channels
// @route   GET /api/channels
export const getChannels = async (req, res) => {
  try {
    // 2. Filter: Public OR (Private AND I am a member)
    const channels = await Channel.find({
      $or: [
        { type: "public" },
        { members: req.userId }
      ]
    })
    .populate("members", "username avatar")
    .sort({ updatedAt: -1 });

    res.json(channels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add member to private channel
// @route   PUT /api/channels/:channelId/add_member
export const addMember = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { email } = req.body; // We will add by Email

    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    // Find user by email
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: "User not found" });

    // Check if already member
    if (channel.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: "User already in channel" });
    }

    channel.members.push(userToAdd._id);
    await channel.save();
    
    // Notify via Socket (so the added user sees the channel appear instantly)
    // In a real app, we'd emit to specific socket ID, but broadcasting 'new_channel' 
    // works because the frontend filters duplicates anyway.
    const populatedChannel = await channel.populate("members", "username avatar");
    req.io.emit("new_channel", populatedChannel); 

    res.json(populatedChannel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a channel
// @route   POST /api/channels/:channelId/join
export const joinChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.userId; // From middleware

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check if user is already a member
    if (channel.members.includes(userId)) {
      return res.status(400).json({ message: "Already a member" });
    }

    // Add user to members array
    channel.members.push(userId);
    await channel.save();

    // Return the updated channel with populated members (so frontend updates immediately)
    const updatedChannel = await channel.populate("members", "username email");
    
    res.json(updatedChannel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave a channel
// @route   PUT /api/channels/:channelId/leave
export const leaveChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.userId;

    // Use MongoDB $pull operator to remove the user from the array efficiently
    const updatedChannel = await Channel.findByIdAndUpdate(
      channelId,
      { $pull: { members: userId } }, // Logic: Remove specific User ID
      { new: true } // Return the updated document
    ).populate("members", "username email");

    if (!updatedChannel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    res.json(updatedChannel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};