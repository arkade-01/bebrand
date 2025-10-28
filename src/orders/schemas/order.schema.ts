import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export class OrderItem {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  quantity: number;

  // These will be populated from the product when the order is created
  @Prop()
  productName?: string;

  @Prop()
  price?: number;

  @Prop()
  subtotal?: number;
}

export class ShippingAddress {
  @Prop({ required: true })
  street: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  zipCode: string;

  @Prop({ required: true })
  country: string;
}

export class GuestInfo {
  @Prop({ required: true })
  email: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop()
  phone?: string;
}

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  // Guest customer information
  @Prop()
  customerEmail?: string;

  @Prop()
  customerFirstName?: string;

  @Prop()
  customerLastName?: string;

  @Prop()
  customerPhone?: string;

  @Prop({ required: true })
  shippingAddress: string;

  @Prop()
  notes?: string;

  @Prop()
  paymentReference?: string;

  @Prop({ default: false })
  isGuestOrder: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
