import mongoose, { Document, Schema, Model } from "mongoose";

export type UserNotificationType =
  | "payment_paid"
  | "profile_updated"
  | "avatar_updated";

export interface IUserNotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: UserNotificationType;
  title: string;
  body: string;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserNotificationSchema = new Schema<IUserNotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["payment_paid", "profile_updated", "avatar_updated"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    readAt: { type: Date },
  },
  { timestamps: true },
);

UserNotificationSchema.index({ userId: 1, createdAt: -1 });

const UserNotification: Model<IUserNotification> = mongoose.model<IUserNotification>(
  "UserNotification",
  UserNotificationSchema,
);
export default UserNotification;
