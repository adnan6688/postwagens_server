import mongoose, { Schema } from "mongoose";
import { ReportedUser } from "./userReport.interfaces";

const reportedUserSchema = new Schema<ReportedUser>(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    report: {
      type: String,
      required: true,
    },
    blockedId: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userInfo: { type: Schema.Types.Mixed  },
  },
  { timestamps: true , versionKey : false },
);

const ReportedUserModel = mongoose.model<ReportedUser>("ReportedUser", reportedUserSchema,);

export default ReportedUserModel;
