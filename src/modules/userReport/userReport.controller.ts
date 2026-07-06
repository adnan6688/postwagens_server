import { Request, Response } from "express";
import BlockedUserModel from "../userBlocked/userBlocked.model";
import ReportedUserModel from "./userReport.model";
import Post from "../post/post.model";
import Listing from "../listing/listing.model";
import User from "../users/user.model";
import { JwtPayload } from "jsonwebtoken";
import { Follow } from "../follow/follow.model";


export const reportUser = async (req: Request, res: Response) => {
  try {
    const { type, id, report, blockedId } = req.body;
    let reportType;
    let userToReport: any;
    let targetBlockedId: string | undefined;


    if (type === "post") {
      reportType = "post";
      userToReport = await Post.findById(id);
      targetBlockedId = userToReport?.userId;
    } else if (type === "listing") {
      reportType = "listing";
      userToReport = await Listing.findById(id);
      targetBlockedId = userToReport?.sellerId;
    } else if (type === "user") {
      reportType = "user";
      userToReport = await User.findById(id);
      targetBlockedId = id;
    }

    if (!userToReport) {
      return res.status(404).json({ message: `${type} not found` });
    }

    const userInfo = await User.findById(targetBlockedId);


    if (!userInfo) {
      return res.status(404).json({ message: "User information not found" });
    }

    const blockerUser = req.user as JwtPayload;
    const blockerID = blockerUser.userId;

    const lastReported = await ReportedUserModel.findOne({
      userId: targetBlockedId,
      report: report,
      createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
    });

    if (lastReported) {
      return res.status(400).json({
        message: `You can only report this ${reportType} once every 30 minutes.`,
      });
    }

    const reportedUser = new ReportedUserModel({
      id,
      type,
      report,
      blockedId,
      userId: targetBlockedId,
      userInfo: userInfo,
    });

    await reportedUser.save();

    if (blockedId) {
      const blockUser = new BlockedUserModel({
        blockerUserid: blockerID,
        blockedUserid: targetBlockedId,
        isBlocked: true,
      });

      await blockUser.save();

      const followRelationship = await Follow.findOne({
        follower: blockerID,
      });

      if (followRelationship) {
        await Follow.deleteOne({ _id: followRelationship._id });

        return res.status(200).json({
          message: "User reported, blocked, and follow relationship removed",
        });
      }

      return res.status(200).json({
        message: "User reported and blocked successfully",
      });
    }

    return res.status(200).json({
      message: "User reported successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllReports = async (req: Request, res: Response) => {
  try {
    const { fullName } = req.query;

    const query: any = {};

    if (fullName) {
      query["userInfo.fullName"] = new RegExp(fullName as string, "i");
    }

    const reports = await ReportedUserModel.find(query)
      .populate("userInfo userId")
      .exec();

    if (reports.length === 0) {
      return res.status(404).json({ message: "No reports found" });
    }

    return res.status(200).json({
      message: "Reports retrieved successfully",
      data: reports,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteReport = async (req: Request, res: Response) => {
  try {
    const { _id } = req.query;
    const report = await ReportedUserModel.findById(_id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.type === "post") {
      await Post.findByIdAndUpdate(report.id, { isDeleted: true });
      return res.status(200).json({ message: "Post marked as deleted" });
    } else if (report.type === "listing") {
      await Listing.findByIdAndUpdate(report.id, { isDeleted: true });
      return res.status(200).json({ message: "Listing marked as deleted" });
    } else if (report.type === "user") {
      await User.findByIdAndUpdate(report.userId, { isDeleted: true });
      return res.status(200).json({ message: "User marked as deleted" });
    }

    return res.status(400).json({ message: "Invalid report type" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};





export const getReportSummary = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = (req.query.search as string) || "";

    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      {
        $group: {
          _id: "$userId",
          reportCount: { $sum: 1 },
          userInfo: { $first: "$userInfo" },
        },
      },
    ];

    // Search by name or email
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            {
              "userInfo.fullName": {
                $regex: search,
                $options: "i",
              },
            },
            {
              "userInfo.email": {
                $regex: search,
                $options: "i",
              },
            },
          ],
        },
      });
    }

    pipeline.push(
      {
        $project: {
          _id: 0,
          userId: "$_id",
          fullName: "$userInfo.fullName",
          email: "$userInfo.email",
          profilePhoto: "$userInfo.profilePhoto",
          role : "$userInfo.role",
          reportCount: 1,
          level: {
            $switch: {
              branches: [
                {
                  case: { $lt: ["$reportCount", 5] },
                  then: "Normal",
                },
                {
                  case: { $eq: ["$reportCount", 5] },
                  then: "Medium",
                },
                {
                  case: { $gt: ["$reportCount", 5] },
                  then: "Dangerous",
                },
              ],
              default: "Normal",
            },
          },
        },
      },
      {
        $sort: {
          reportCount: -1,
        },
      },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
          ],
          totalCount: [
            {
              $count: "count",
            },
          ],
        },
      }
    );

    const result = await ReportedUserModel.aggregate(pipeline);

    const reports = result[0].data;
    const total = result[0].totalCount[0]?.count || 0;

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: reports,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};