import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  dog: mongoose.Types.ObjectId;
  reviewer: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  dog: {
    type: Schema.Types.ObjectId,
    ref: 'Dog',
    required: true
  },
  reviewer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// One review per user per dog
ReviewSchema.index({ dog: 1, reviewer: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', ReviewSchema);