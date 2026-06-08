import { Model, Types } from 'mongoose';
export interface IImageAndVideo {
  type: 'image' | 'video';
  url: string;
}

export type TPost = {
  userId: Types.ObjectId;
  text: string;
  imagesAndVideos?: IImageAndVideo[];
  isDeleted : boolean
};

export type PostModel = Model<TPost, Record<string, unknown>>;