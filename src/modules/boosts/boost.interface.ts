import { Types } from 'mongoose';

export interface IBoost {
  listingId: Types.ObjectId;
  userId: Types.ObjectId;
  startAt: Date;
  endAt: Date;
  productId: string;
  name: string;
  price: number;
  durationDays: number;
}
