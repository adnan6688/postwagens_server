import { Schema, model } from 'mongoose';
import { TComment, CommentModel } from './comment.interface';

const commentSchema = new Schema<TComment, CommentModel>(
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
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete (ret as any).userId;
        delete ret.parentId;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  },
);

commentSchema.virtual('user', {
  ref: 'user',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

commentSchema.virtual('parentComment', {
  ref: 'Comment',
  localField: 'parentId',
  foreignField: '_id',
  justOne: true,
});

export const Comment = model<TComment, CommentModel>('Comment', commentSchema);
