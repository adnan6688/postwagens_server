import { NextFunction, Request, Response } from "express";
import { CatchAsync } from "../../utils/CatchAsync";
import { SendResponse } from "../../utils/SendResponse";
import { blockedService } from "./userBlocked.service";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Follow } from "../follow/follow.model";

const blockUser = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { blockedId } = req.body;

    if (!blockedId) {
      return SendResponse(res, {
        success: false,
        statusCode: 400,
        message: "Missing blocked user ID",
        data: "",
      });
    }

    const blockerUser = req.user as JwtPayload;
    let blockerID = blockerUser.userId;
    console.log(blockerID)

    const result = await blockedService.blockUser(blockerID, blockedId);

    if (blockerID) {
      const followRelationship = await Follow.findOne({
        follower: blockerID,
      });

      if (followRelationship) {
        await Follow.deleteOne({ _id: followRelationship._id });


        SendResponse(res, {
          success: true,
          statusCode: 200,
          message: "User reported, blocked, and follow relationship removed",
          data: result,
        });
      }
    }

    SendResponse(res, {
      success: true,
      statusCode: 200,
      message: "User blocked successfully",
      data: result,
    });

    return;
  },
);

const unblockUser = CatchAsync(async (req: Request, res: Response) => {
  const { blockedId } = req.body;

  if (!blockedId) {
    return SendResponse(res, {
      success: false,
      statusCode: 400,
      message: "Missing blocked user ID",
      data: "",
    });
  }

  const blockerUser = req.user as JwtPayload;
  const blockerID = blockerUser.userId;

  const result = await blockedService.unblockUser(blockerID, blockedId);

  SendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User unblocked successfully",
    data: result,
  });
});

const getAllBlockedUsers = async (req: Request, res: Response) => {
  try {
    const blockerUser = req.user as JwtPayload;
    const blockerID = blockerUser.userId;

    const blockedUsers = await blockedService.getBlockedUsersByUser(blockerID);

    return res.status(200).json({
      success: true,
      message: `${blockedUsers.length} users blocked`,
      data: blockedUsers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const blockedController = {
  blockUser,
  unblockUser,
  getAllBlockedUsers,
};
