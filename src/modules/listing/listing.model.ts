import { Schema, model } from 'mongoose';
import { IListing, ListingCategory } from './listing.interface';

const listingSchema = new Schema<IListing>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    isDeleted: { type: Boolean, default: false },
    imagesAndVideos: [
      {
        type: { type: String, enum: ['image', 'video'], required: true },
        url: { type: String, required: true },
      },
    ],
    category: {
      type: String,
      enum: Object.values(ListingCategory),
      required: true,
    },
    condition: { type: String, required: true },
    location: { type: String, required: true },
    sold: { type: Boolean, default: false },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isBoosted: { type: Boolean, default: false },
    viewCount: {
      type: Number,
      default: 0,
    },
    inquiryCount: {
      type: Number,
      default: 0,
    },
    year: { type: Number, default: null },
    mileage: { type: Number, default: null },
    trans: { type: String, default: null },
    color: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    }
  }
);

// listingSchema.virtual('seller', {
//   ref: 'user',
//   localField: 'sellerId',
//   foreignField: '_id',
//   justOne: true,
// });

listingSchema.virtual("seller", {
  ref: "User",
  localField: "sellerId",
  foreignField: "_id",
  justOne: true,
});

listingSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete (ret as any).sellerId;
    return ret;
  }
});

listingSchema.index({ title: 'text', description: 'text', location: 'text' });


const Listing = model<IListing>('Listing', listingSchema);

export default Listing;
