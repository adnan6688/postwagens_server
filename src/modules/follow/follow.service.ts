import { Follow } from './follow.model';
import { NotificationService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notifications.interface';
import { Types } from 'mongoose';

const toggleFollow = async (followerId: string, followingId: string) => {
    const isFollowing = await Follow.findOne({ follower: followerId, following: followingId });

    if (isFollowing) {
        await Follow.findOneAndDelete({ follower: followerId, following: followingId });
        return { following: false };
    } else {
        const follow = await Follow.create({ follower: followerId, following: followingId });

        // Create notification
        await NotificationService.createNotification({
            userId: new Types.ObjectId(followingId),
            actorId: new Types.ObjectId(followerId),
            type: NotificationType.FOLLOW,
            entity: {
                followId: follow._id,
            },
            isRead: false,
        });

        return { following: true };
    }
};


const getFollowers = async (userId: string) => {
  return await Follow.find({ following: userId }).populate('follower');
};

const getFollowing = async (userId: string) => {
  return await Follow.find({ follower: userId }).populate('following');
};

const isFollowing = async (follower: string, following: string) => {
    return !!(await Follow.findOne({ follower, following }));
};

export const FollowService = {
  toggleFollow,
  getFollowers,
  getFollowing,
  isFollowing,
};