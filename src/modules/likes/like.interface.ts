import { Model, Types } from 'mongoose';

export type TLike = {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
};

export interface LikeModel extends Model<TLike> {
  // eslint-disable-next-line no-unused-vars
  isLikedByUser(postId: string, userId: string): Promise<TLike | null>;
}
