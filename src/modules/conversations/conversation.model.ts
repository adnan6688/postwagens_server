import { Schema, model } from 'mongoose';
import { IConversation } from './conversation.interface';

const conversationSchema = new Schema<IConversation>(
  {
    participantAId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    participantBId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

conversationSchema.index({ participantAId: 1, participantBId: 1 }, { unique: true });

export const Conversation = model<IConversation>(
  'Conversation',
  conversationSchema,
);
