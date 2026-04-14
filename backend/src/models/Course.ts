import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICourseLesson {
  lessonId: mongoose.Types.ObjectId;
  order: number;
}

export interface IIncludedMerch {
  merchId: mongoose.Types.ObjectId;
  quantity: number;
}

export interface ICourse extends Document {
  name: string;
  description: string;
  coverImage?: string;
  lessons: ICourseLesson[];
  price: number;
  durationDays: number;
  includedMerch: IIncludedMerch[];
  isActive: boolean;
  isFree: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CourseLessonSchema = new Schema<ICourseLesson>(
  {
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const IncludedMerchSchema = new Schema<IIncludedMerch>(
  {
    merchId: { type: Schema.Types.ObjectId, ref: "Merch", required: true },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false },
);

const CourseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    coverImage: { type: String },
    lessons: { type: [CourseLessonSchema], default: [] },
    price: { type: Number, required: true, min: 0 },
    durationDays: { type: Number, required: true, min: 1 },
    includedMerch: { type: [IncludedMerchSchema], default: [] },
    isActive: { type: Boolean, default: true },
    isFree: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Course: Model<ICourse> = mongoose.model<ICourse>("Course", CourseSchema);
export default Course;
