import { Types } from 'mongoose';

export interface IBookmark {
  userId: Types.ObjectId;
  listingId: Types.ObjectId;
}
