import { Schema, model } from 'mongoose';
import { IFollow, FollowModel } from './follow.interface';

const followSchema = new Schema<IFollow, FollowModel>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

followSchema.index({ follower: 1, following: 1 }, { unique: true });

export const Follow = model<IFollow, FollowModel>('Follow', followSchema);
