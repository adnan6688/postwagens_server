import User from "../users/user.model";
import BlockedUserModel from "./userBlocked.model";

const blockUser = async (blockerId: string, blockedId: string) => {
  try {
    const existingBlock = await BlockedUserModel.findOne({
      blockerUserid: blockerId,
      blockedUserid: blockedId,
    });

    if (existingBlock) {
      throw new Error("User is already blocked");
    }

    const blockEntry = new BlockedUserModel({
      blockerUserid: blockerId,
      blockedUserid: blockedId,
      isBlocked: true,
      createdAt: new Date(),
    });

    await blockEntry.save();
    return { success: true, message: "User blocked successfully" };
  } catch (error: any) {
    throw new Error(error.message || "Error blocking user");
  }
};

const unblockUser = async (blockerId: string, blockedId: string) => {
  try {
    const existingBlock = await BlockedUserModel.findOneAndDelete({
      blockerUserid: blockerId,
      blockedUserid: blockedId,
    });

    if (!existingBlock) {
      throw new Error("No block entry found for these users");
    }

    return { success: true, message: "User unblocked successfully" };
  } catch (error: any) {
    throw new Error(error.message || "Error unblocking user");
  }
};

const getBlockedUsersByUser = async (blockerUserId: string) => {
  try {
    const blockedUsers = await BlockedUserModel.find({
      blockerUserid: blockerUserId,
    })
      .select("blockedUserid")
      .populate({
        path: "blockedUserid", 
        model: User, 
      });

    return blockedUsers;
  } catch (error) {
    throw new Error("Error while fetching blocked users");
  }
};

export const blockedService = { blockUser, unblockUser, getBlockedUsersByUser };
