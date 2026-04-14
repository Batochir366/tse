import mongoose, { Document, Schema, Model } from 'mongoose';

export type MerchType = 'pin' | 'ayga' | 'tshirt' | 'other';

export interface IMerch extends Document {
  name: string;
  description?: string;
  type: MerchType;
  imageUrl: string;
  price: number;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MerchSchema = new Schema<IMerch>(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String },
    type:        { type: String, enum: ['pin', 'ayga', 'tshirt', 'other'], required: true },
    imageUrl:    { type: String, required: true },
    price:       { type: Number, required: true, min: 0 },
    stock:       { type: Number, default: 0, min: 0 },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Merch: Model<IMerch> = mongoose.model<IMerch>('Merch', MerchSchema);
export default Merch;
