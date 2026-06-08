import { Schema, model } from 'mongoose';
import { TPost } from './post.interface';

const postSchema = new Schema<TPost>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    isDeleted : {type: Boolean, default: false},
    text: { type: String, required: true },
    imagesAndVideos: [
      {
        type: {
          type: String,
        },
        url: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        // 🔁 rename userId -> user
        (ret as any).user = ret.userId;
        delete (ret as any).userId;
        return ret;
      },
    },
  },
);


const Post = model<TPost>('Post', postSchema);

export default Post;
