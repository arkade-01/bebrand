import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private emailService: EmailService,
    private usersService: UsersService,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
    const totalAmount = createOrderDto.items.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );

    const order = new this.orderModel({
      userId: new Types.ObjectId(userId),
      items: createOrderDto.items,
      totalAmount,
      shippingAddress: createOrderDto.shippingAddress,
      notes: createOrderDto.notes,
    });

    const savedOrder = await order.save();

    // Send order confirmation email
    try {
      const user = await this.usersService.findById(userId);
      if (user) {
        await this.emailService.sendOrderConfirmationEmail(
          user.email,
          user.firstName || 'Customer',
          {
            orderId: String(savedOrder._id),
            items: createOrderDto.items,
            totalAmount: totalAmount,
            shippingAddress: createOrderDto.shippingAddress,
          },
        );
      }
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
    }

    return savedOrder;
  }

  async createGuestOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    // Validate guest info is provided
    if (!createOrderDto.guestInfo || !createOrderDto.guestInfo.email) {
      throw new BadRequestException(
        'Guest email is required for guest checkout',
      );
    }

    const totalAmount = createOrderDto.items.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );

    const order = new this.orderModel({
      guestInfo: createOrderDto.guestInfo,
      items: createOrderDto.items,
      totalAmount,
      shippingAddress: createOrderDto.shippingAddress,
      notes: createOrderDto.notes,
      isGuestOrder: true,
    });

    const savedOrder = await order.save();

    // Send order confirmation email to guest
    try {
      await this.emailService.sendOrderConfirmationEmail(
        createOrderDto.guestInfo.email,
        createOrderDto.guestInfo.firstName || 'Guest',
        {
          orderId: String(savedOrder._id),
          items: createOrderDto.items,
          totalAmount: totalAmount,
          shippingAddress: createOrderDto.shippingAddress,
        },
      );
    } catch (error) {
      console.error('Failed to send guest order confirmation email:', error);
    }

    return savedOrder;
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel
      .find()
      .populate('userId', 'email firstName lastName')
      .exec();
  }

  async findAllByUser(userId: string): Promise<Order[]> {
    return this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Order> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const order = await this.orderModel
      .findById(id)
      .populate('userId', 'email firstName lastName')
      .exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const order = await this.orderModel
      .findByIdAndUpdate(id, updateOrderDto, { new: true })
      .populate('userId', 'email firstName lastName')
      .exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async remove(id: string): Promise<Order> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const order = await this.orderModel.findByIdAndDelete(id).exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }
}
