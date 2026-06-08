import { Schema, model } from 'mongoose';
import { TLike, LikeModel } from './like.interface';

const likeSchema = new Schema<TLike, LikeModel>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'post',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

likeSchema.statics.isLikedByUser = async function (
  postId: string,
  userId: string,
) {
  return await Like.findOne({ postId, userId });
};

// Ensure that a user can only like a post once
likeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const Like = model<TLike, LikeModel>('Like', likeSchema);
