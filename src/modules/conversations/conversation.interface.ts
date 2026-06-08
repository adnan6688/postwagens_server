import { Types } from 'mongoose';

export interface IConversation {
  participantAId: Types.ObjectId;
  participantBId: Types.ObjectId;
}
