import { Types } from "mongoose";

export interface BlockedUser {
    blockerUserid: Types.ObjectId;
  blockedUserid: Types.ObjectId;
  isBlocked: boolean; 
  createdAt: Date;
  updatedAt: Date;
}
