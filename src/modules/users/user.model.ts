import mongoose, { model, Types } from 'mongoose';
import {
  IAuthProvider,
  IsActive,
  IUser,
  Role,
} from './user.interface';
import bcrypt from 'bcrypt';
import env from '../../config/env';


// ============USER MAIN SCHEMA=============
const authProviderSchema = new mongoose.Schema<IAuthProvider>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const userSchema = new mongoose.Schema<IUser>(
  {
    fullName: { type: String },
    bio: { type: String, default: null },
    email: { type: String, required: true, unique: true, lowercase: true },
    avatar: { type: String, default: null },
    password: { type: String, select: false },
    fcmToken: { type: String },
    verifiedBadge: { type: Boolean, default: false },
    verifiedBadgeExpiration: { type: Date },
    isVerified: { type: Boolean, default: false },
    isActive: {
      type: String,
      enum: [...Object.values(IsActive)],
      default: IsActive.ACTIVE,
    },
    isDeleted: { type: Boolean, default: false },
    role: { type: String, enum: [...Object.values(Role)], default: Role.USER },
    auths: [authProviderSchema],
    location: { type: String },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// Hashed password
userSchema.pre('save', async function () {
  if (!this.password) return;
  const hashedPassword = await bcrypt.hash(
    this.password,
    parseInt(env.BCRYPT_SALT_ROUND)
  );
  this.password = hashedPassword;
});

// Indexing through search field
userSchema.index({
  fullName: 'text',
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;