import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface ICourseAccess {
  courseId: mongoose.Types.ObjectId;
  expiresAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  courseAccess: ICourseAccess[];
  refreshToken?: string;
  resetOtp?: string;
  resetOtpExpires?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
  hasCourseAccess(courseId: mongoose.Types.ObjectId): boolean;
}

const CourseAccessSchema = new Schema<ICourseAccess>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    expiresAt: { type: Date, required: true },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name:          { type: String, required: true, trim: true },
    email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:      { type: String, required: true, select: false },
    phone:         { type: String },
    avatar:        { type: String },
    courseAccess:  { type: [CourseAccessSchema], default: [] },
    refreshToken:     { type: String, select: false },
    resetOtp:         { type: String, select: false },
    resetOtpExpires:  { type: Date, select: false },
    isActive:         { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.hasCourseAccess = function (
  courseId: mongoose.Types.ObjectId
): boolean {
  const now = new Date();
  return this.courseAccess.some(
    (a: ICourseAccess) => a.courseId.equals(courseId) && a.expiresAt > now
  );
};

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default User;
