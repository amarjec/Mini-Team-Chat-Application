import Message from "../models/messageModel.js";

// @desc    Get messages (with optional search)
// @route   GET /api/messages/:channelId?search=keyword
export const getMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { search } = req.query; // Check for search query

    let query = { channel: channelId };

    // If search exists, add regex filter (case-insensitive)
    if (search) {
      query.content = { $regex: search, $options: "i" };
    }

    const messages = await Message.find(query)
      .populate("sender", "username avatar email")
      .sort({ createdAt: 1 }); // Oldest to Newest

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Edit a message
// @route   PUT /api/messages/:messageId
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Security Check: Only sender can edit
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to edit this message" });
    }

    message.content = content;
    const updatedMessage = await message.save();

    // Broadcast update to channel
    req.io.to(message.channel.toString()).emit("message_updated", {
      _id: updatedMessage._id,
      content: updatedMessage.content,
    });

    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Soft Delete a message
// @route   DELETE /api/messages/:messageId
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Security Check
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    // --- SOFT DELETE LOGIC ---
    message.isDeleted = true;
    message.content = "This message was deleted";
    
    const updatedMessage = await message.save();

    // Broadcast as an UPDATE, not a DELETE (since the bubble still exists)
    req.io.to(message.channel.toString()).emit("message_updated", updatedMessage);

    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};