/* eslint-disable */
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
import { Product } from '../products/schemas/product.schema';
import { EmailService } from '../email/email.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly emailService: EmailService,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    userId?: string,
  ): Promise<Order> {
    // Fetch product information for each item
    const orderItems = await Promise.all(
      createOrderDto.items.map(async (item) => {
        const product = await this.productModel.findById(item.productId);
        if (!product) {
          throw new BadRequestException(
            `Product with ID ${item.productId} not found`,
          );
        }

        // Check if product is in stock
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          );
        }

        const price = product.price;
        const subtotal = price * item.quantity;

        return {
          productId: item.productId,
          quantity: item.quantity,
          productName: product.name,
          price: price,
          subtotal: subtotal,
        };
      }),
    );

    // Calculate total amount
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );

    const orderData: any = {
      items: orderItems,
      totalAmount,
      shippingAddress: createOrderDto.shippingAddress,
      notes: createOrderDto.notes,
      customerEmail: createOrderDto.customerEmail,
      customerFirstName: createOrderDto.customerFirstName,
      customerLastName: createOrderDto.customerLastName,
      customerPhone: createOrderDto.customerPhone,
    };

    // If user is authenticated, add userId
    if (userId) {
      orderData.userId = new Types.ObjectId(userId);
    }

    // Create the order
    const order = new this.orderModel(orderData);
    const savedOrder = await order.save();

    // Update product stock
    await Promise.all(
      orderItems.map(async (item) => {
        await this.productModel.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }),
    );

    // Send order confirmation email
    try {
      const orderForEmail = {
        orderId: (savedOrder._id as any).toString(),
        items: savedOrder.items.map(item => ({
          productName: item.productName || 'Unknown Product',
          quantity: item.quantity,
          price: item.price || 0,
          subtotal: item.subtotal || 0,
        })),
        totalAmount: savedOrder.totalAmount,
        shippingAddress: savedOrder.shippingAddress as any,
      };
      
      await this.emailService.sendOrderConfirmationEmail(
        createOrderDto.customerEmail,
        createOrderDto.customerFirstName,
        orderForEmail,
      );
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      // Don't fail the order if email fails
    }

    return savedOrder;
  }

  async createGuestOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    // For guest orders, ensure guest info is provided
    if (!createOrderDto.guestInfo) {
      throw new BadRequestException(
        'Guest information is required for guest checkout',
      );
    }

    // Fetch product information for each item
    const orderItems = await Promise.all(
      createOrderDto.items.map(async (item) => {
        const product = await this.productModel.findById(item.productId);
        if (!product) {
          throw new BadRequestException(
            `Product with ID ${item.productId} not found`,
          );
        }

        // Check if product is in stock
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          );
        }

        const price = product.price;
        const subtotal = price * item.quantity;

        return {
          productId: item.productId,
          quantity: item.quantity,
          productName: product.name,
          price: price,
          subtotal: subtotal,
        };
      }),
    );

    // Calculate total amount
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );

    const orderData = {
      items: orderItems,
      totalAmount,
      shippingAddress: createOrderDto.shippingAddress,
      notes: createOrderDto.notes,
      customerEmail: createOrderDto.guestInfo.email,
      customerFirstName: createOrderDto.guestInfo.firstName,
      customerLastName: createOrderDto.guestInfo.lastName,
      customerPhone: createOrderDto.guestInfo.phone,
      isGuestOrder: true,
    };

    // Create the order
    const order = new this.orderModel(orderData);
    const savedOrder = await order.save();

    // Update product stock
    await Promise.all(
      orderItems.map(async (item) => {
        await this.productModel.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }),
    );

    // Send order confirmation email
    try {
      const orderForEmail = {
        orderId: (savedOrder._id as any).toString(),
        items: savedOrder.items.map(item => ({
          productName: item.productName || 'Unknown Product',
          quantity: item.quantity,
          price: item.price || 0,
          subtotal: item.subtotal || 0,
        })),
        totalAmount: savedOrder.totalAmount,
        shippingAddress: savedOrder.shippingAddress as any,
      };
      
      await this.emailService.sendOrderConfirmationEmail(
        createOrderDto.guestInfo.email,
        createOrderDto.guestInfo.firstName || 'Guest',
        orderForEmail,
      );
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      // Don't fail the order if email fails
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
