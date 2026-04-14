import mongoose, { Document, Schema, Model } from "mongoose";

export interface ILesson extends Document {
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: false },
    videoUrl: { type: String, required: true },
    thumbnail: { type: String, required: false },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Lesson: Model<ILesson> = mongoose.model<ILesson>("Lesson", LessonSchema);
export default Lesson;
