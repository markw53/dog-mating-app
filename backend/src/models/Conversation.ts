import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  dogReference?: mongoose.Types.ObjectId;
  lastMessage?: string;
  lastMessageAt: Date;
  createdAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  dogReference: {
    type: Schema.Types.ObjectId,
    ref: 'Dog'
  },
  lastMessage: String,
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique conversations between two users
ConversationSchema.index({ participants: 1 }, { unique: true });

export default mongoose.model<IConversation>('Conversation', ConversationSchema);