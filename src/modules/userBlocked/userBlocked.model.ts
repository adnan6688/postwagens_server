import mongoose, { Schema } from "mongoose";
import { BlockedUser } from "./userBlocked.interfaces";

const blockedUserSchema = new Schema(
  {
    blockerUserid: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blockedUserid: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isBlocked: {
      type: Boolean,
      default: false, 
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const BlockedUserModel = mongoose.model<BlockedUser & Document>("BlockedUser",blockedUserSchema,);

export default BlockedUserModel;
