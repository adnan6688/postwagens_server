import { Types } from 'mongoose';

export enum ListingCategory {
  Cars = 'cars',
  OffRoad = 'offRoad',
  Parts = 'parts',
  Accessories = 'accessories',
  Services = 'services',
}


export interface IImageAndVideo {
  type: 'image' | 'video';
  url: string;
}

export interface IListing {
  title: string;
  description: string;
  price: number;
  isDeleted: boolean,
  imagesAndVideos: IImageAndVideo[];
  category: ListingCategory;
  condition: string;
  location: string;
  sold: boolean;
  sellerId: Types.ObjectId;
  isBoosted?: boolean;
  viewCount?: number;
  inquiryCount?: number;
  year?: number;
  mileage?: number;
  trans?: string;
  color?: string;
}