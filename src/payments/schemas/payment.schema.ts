import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  ABANDONED = 'abandoned',
}

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true, unique: true })
  reference: string;

  @Prop({ enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop()
  paystackReference?: string;

  @Prop()
  accessCode?: string;

  @Prop()
  authorizationUrl?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  paidAt?: Date;

  @Prop()
  channel?: string;

  @Prop()
  currency?: string;

  @Prop()
  ipAddress?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
