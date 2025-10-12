import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

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

    return order.save();
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
