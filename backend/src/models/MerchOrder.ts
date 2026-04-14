import mongoose, { Document, Schema, Model } from 'mongoose';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface IOrderItem {
  merchId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IMerchOrder extends Document {
  userId: mongoose.Types.ObjectId;
  paymentId?: mongoose.Types.ObjectId;
  items: IOrderItem[];
  status: OrderStatus;
  isGift: boolean;
  shippingAddress?: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    merchId:  { type: Schema.Types.ObjectId, ref: 'Merch', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price:    { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const MerchOrderSchema = new Schema<IMerchOrder>(
  {
    userId:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
    paymentId:       { type: Schema.Types.ObjectId, ref: 'Payment' },
    items:           { type: [OrderItemSchema], required: true },
    status:          { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    isGift:          { type: Boolean, default: false },
    shippingAddress: { type: String },
    trackingNumber:  { type: String },
  },
  { timestamps: true }
);

const MerchOrder: Model<IMerchOrder> = mongoose.model<IMerchOrder>('MerchOrder', MerchOrderSchema);
export default MerchOrder;
