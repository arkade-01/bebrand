import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Newsletter extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  unsubscribedAt?: Date;
}

export const NewsletterSchema = SchemaFactory.createForClass(Newsletter);
