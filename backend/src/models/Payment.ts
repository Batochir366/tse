import mongoose, { Document, Schema, Model } from "mongoose";
import type { QPayUrl } from "../types/qpay";

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED';
export type PaymentItemType = 'course' | 'merch';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  itemType: PaymentItemType;
  itemId: mongoose.Types.ObjectId;
  amount: number;
  status: PaymentStatus;
  qpayInvoiceId?: string;
  qpayPaymentId?: string;
  invoiceExpiresAt?: Date;
  paidAt?: Date;
  qrImage?: string;
  qrText?: string;
  invoiceUrls?: QPayUrl[];
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    itemType:      { type: String, enum: ['course', 'merch'], required: true },
    itemId:        { type: Schema.Types.ObjectId, required: true },
    amount:        { type: Number, required: true, min: 0 },
    status:            { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED'], default: 'PENDING' },
    qpayInvoiceId:     { type: String },
    qpayPaymentId:     { type: String },
    invoiceExpiresAt:  { type: Date },
    paidAt:            { type: Date },
    qrImage:           { type: String },
    qrText:            { type: String },
    invoiceUrls:       { type: [Schema.Types.Mixed], default: undefined },
  },
  { timestamps: true }
);

const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', PaymentSchema);
export default Payment;
