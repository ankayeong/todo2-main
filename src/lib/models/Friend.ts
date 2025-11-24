import { Schema, models, model } from "mongoose";

const friendSchema = new Schema(
  {
    requesterId: {
      type: String,
      required: true,
    },
    requesterName: {
      type: String,
      required: true,
    },
    recipientId: {
      type: String,
      required: true,
    },
    recipientName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

friendSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });

const Friend = models.Friend || model("Friend", friendSchema);

export default Friend;