import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum StockStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
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
  address: string;

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

  @Prop({ type: String, default: 'pending' })
  paymentStatus: string;

  // Guest customer information (Legacy fields)
  @Prop()
  customerEmail?: string;

  @Prop()
  customerFirstName?: string;

  @Prop()
  customerLastName?: string;

  @Prop()
  customerPhone?: string;

  // Guest information (New structure)
  @Prop({ type: GuestInfo })
  guestInfo?: GuestInfo;

  @Prop({ type: ShippingAddress, required: true })
  shippingAddress: ShippingAddress;

  @Prop()
  notes?: string;

  @Prop()
  paymentReference?: string;

  @Prop({ default: false })
  isGuestOrder: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
