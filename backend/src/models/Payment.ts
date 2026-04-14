import mongoose, { Document, Schema, Model } from 'mongoose';

export type PaymentStatus   = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentItemType = 'course' | 'merch';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  itemType: PaymentItemType;
  itemId: mongoose.Types.ObjectId;
  amount: number;
  status: PaymentStatus;
  qpayInvoiceId?: string;
  qpayPaymentId?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    itemType:      { type: String, enum: ['course', 'merch'], required: true },
    itemId:        { type: Schema.Types.ObjectId, required: true },
    amount:        { type: Number, required: true, min: 0 },
    status:        { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], default: 'PENDING' },
    qpayInvoiceId: { type: String },
    qpayPaymentId: { type: String },
    paidAt:        { type: Date },
  },
  { timestamps: true }
);

const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', PaymentSchema);
export default Payment;
