import mongoose, { Document, Schema, Model } from 'mongoose';

export type AnnouncementType = 'concert' | 'sale' | 'poster' | 'news';

export interface IAnnouncement extends Document {
  title: string;
  description?: string;
  imageUrl?: string;
  type: AnnouncementType;
  link?: string;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String },
    imageUrl:    { type: String },
    type:        { type: String, enum: ['concert', 'sale', 'poster', 'news'], required: true },
    link:        { type: String },
    isActive:    { type: Boolean, default: true },
    expiresAt:   { type: Date },
  },
  { timestamps: true }
);

const Announcement: Model<IAnnouncement> = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
export default Announcement;
