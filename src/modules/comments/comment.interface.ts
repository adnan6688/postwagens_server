import { Model, Types } from 'mongoose';

export type TComment = {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  parentId?: Types.ObjectId | null;
  text: string;
};

export type CommentModel = Model<TComment>;
