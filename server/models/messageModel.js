import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // Link to the User who sent it [cite: 33]
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    // Link to the Channel it belongs to [cite: 34]
    channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
    
    // The actual text [cite: 35]
    content: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);