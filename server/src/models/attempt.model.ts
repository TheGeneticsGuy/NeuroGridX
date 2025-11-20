import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAttempt extends Document {
  userId: Types.ObjectId;
  challengeType: string;
  score: number;
  completionTime: number;
  accuracy: number;
  ntpm?: number; // Net Targets Per Minute
  averageClickAccuracy?: number; // 0 to 1
  settings?: {
    mode: string; // Normal or Advanced
    speed?: string; //'Normal', 'Medium', 'Fast'
  };
}

const attemptSchema: Schema<IAttempt> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    challengeType: { type: String, required: true },
    score: { type: Number, required: true },
    completionTime: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    ntpm: { type: Number, required: false },
    averageClickAccuracy: { type: Number, required: false },
    settings: { type: Object, required: false },
  }, { timestamps: true });

const Attempt = mongoose.model<IAttempt>('Attempt', attemptSchema);

export default Attempt;