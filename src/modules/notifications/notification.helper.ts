import { INotification } from './notifications.interface';
import User from '../users/user.model';

const generateNotificationMessage = async (notification: INotification): Promise<string> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actor = notification.actorId as any;
    if (!actor) {
        return 'Unknown action';
    }

    switch (notification.type) {
        case 'like':
            return `${actor.fullName} liked your post.`;
        case 'comment':
            return `${actor.fullName} commented on your post.`;
        case 'follow':
            return `${actor.fullName} started following you.`;
        case 'listing':
            return `${actor.fullName} created a new listing.`;
        case 'message':
            return `${actor.fullName} sent you a message.`;
        default:
            return 'You have a new notification.';
    }
};

export const NotificationHelper = {
    generateNotificationMessage,
};
