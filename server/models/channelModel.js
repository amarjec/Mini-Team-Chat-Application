import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true},
    description: { type: String },
    type: { 
      type: String, 
      enum: ["public", "private"], 
      default: "public" 
    },
    // Array of user IDs to track members [cite: 27]
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export default mongoose.model("Channel", channelSchema);