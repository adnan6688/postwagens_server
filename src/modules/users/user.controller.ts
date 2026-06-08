import { Request, Response } from 'express';
import { CatchAsync } from '../../utils/CatchAsync';
import { SendResponse } from '../../utils/SendResponse';
import { userServices } from './user.service';
import { JwtPayload } from 'jsonwebtoken';
import { uploadBufferToCloudinary } from '../../config/cloudinary.config';
import { IsActive } from './user.interface';
import User from './user.model';
import AppError from '../../errorHelpers/AppError';
import { StatusCodes } from 'http-status-codes';

// REGISTER ACCOUNT
const registerUser = CatchAsync(async (req: Request, res: Response) => {
  const result = await userServices.createUserService(req.body);

  SendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Users created successful!',
    data: result,
  });
});

// GET ME
const getMe = CatchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as JwtPayload;
  const result = await userServices.getMeService(userId);

  SendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User fetched successful!',
    data: result,
  });
});

// GET ME
const getAllUser = CatchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;

  const { userId } = req.user as JwtPayload;
  const result = await userServices.getAllUserService(query, userId);

  SendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Users fetched successful!',
    data: result,
  });
});

// Get Profile
const getProfile = CatchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const loggedInUser = req.user as JwtPayload | undefined;

  const result = await userServices.getProfileService(
    userId as string,
    loggedInUser?.userId,
  );

  SendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Profile fetched successful!',
    data: result,
  });
});

// USER UPDATE
const userUpdate = CatchAsync(async (req: Request, res: Response) => {
  const body = req.body;
  const decodedToken = req.user as JwtPayload;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: { [key: string]: any } = {
    ...body,
  };

  if (req.file) {
    const avatar = await uploadBufferToCloudinary(
      req.file.buffer,
      req.file.originalname
    );
    payload.avatar = avatar?.secure_url;
  }

  const result = await userServices.userUpdateService(
    decodedToken.userId as string,
    payload,
    decodedToken
  );

  SendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User updated successful!',
    data: result,
  });
});

// USER UPDATE
const userDelete = CatchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const decodedToken = req.user as JwtPayload;

  const result = await userServices.userDeleteService(userId as string, decodedToken);

  SendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User deleted successful!',
    data: result,
  });
});

// VERIFY USER
const userVefification = CatchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const result = await userServices.verifyUserService(user.userId);

  SendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OTP has been sent!',
    data: result,
  });
});

// RESEND OTP
const verifyOTP = CatchAsync(async (req: Request, res: Response) => {
  const { phoneNumber, otp } = req.body;
  await userServices.verifyOTPService(phoneNumber, otp);

  SendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Your are verified!',
    data: null,
  });
});

const purchaseBadge = CatchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as JwtPayload;
  const result = await userServices.purchaseBadgeService(userId);

  SendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Badge purchased successfully!',
    data: result,
  });
});


const updateSuspendStatus = CatchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const decodedToken = req.user as JwtPayload;

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
  }

  const newIsActiveStatus = user.isActive === IsActive.ACTIVE ? IsActive.BLOCKED : IsActive.ACTIVE;
  // @ts-ignore
  const result = await userServices.updateSuspendStatusService(userId, newIsActiveStatus, decodedToken);

  SendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User suspended successfully!',
    data: result,
  });
});


const recentUsers = CatchAsync(async (req: Request, res: Response) => {

  const data = await userServices.recentUsers()

  SendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Get Recent users successfully!',
    data: data,
  });
})
// EXPORT ALL CONTROLLERS
export const userControllers = {
  registerUser,
  userVefification,
  verifyOTP,
  getMe,
  userUpdate,
  userDelete,
  getAllUser,
  purchaseBadge,
  updateSuspendStatus,
  getProfile,
  recentUsers
};