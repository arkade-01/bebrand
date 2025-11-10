import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Newsletter } from './schemas/newsletter.schema';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(Newsletter.name) private newsletterModel: Model<Newsletter>,
  ) {}

  async subscribe(subscribeDto: SubscribeNewsletterDto) {
    const { email } = subscribeDto;

    // Check if email already exists
    const existing = await this.newsletterModel.findOne({ email });

    if (existing) {
      // If already subscribed and active
      if (existing.isActive) {
        throw new ConflictException('Email is already subscribed');
      }

      // If previously unsubscribed, reactivate
      existing.isActive = true;
      existing.unsubscribedAt = undefined;
      await existing.save();

      return {
        message: 'Successfully resubscribed to newsletter',
        subscription: existing,
      };
    }

    // Create new subscription
    const subscription = await this.newsletterModel.create({ email });

    return {
      message: 'Successfully subscribed to newsletter',
      subscription,
    };
  }

  async unsubscribe(email: string) {
    const subscription = await this.newsletterModel.findOne({ email });

    if (!subscription) {
      throw new ConflictException('Email is not subscribed');
    }

    if (!subscription.isActive) {
      throw new ConflictException('Email is already unsubscribed');
    }

    subscription.isActive = false;
    subscription.unsubscribedAt = new Date();
    await subscription.save();

    return {
      message: 'Successfully unsubscribed from newsletter',
    };
  }

  async getAllSubscribers(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const subscribers = await this.newsletterModel
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this.newsletterModel.countDocuments({ isActive: true });

    return {
      subscribers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
