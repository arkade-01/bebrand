import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Order } from '../orders/schemas/order.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) {}

  // Dashboard Statistics
  async getDashboardStats() {
    const totalUsers = await this.userModel.countDocuments();
    const totalOrders = await this.orderModel.countDocuments();

    const pendingOrders = await this.orderModel.countDocuments({
      status: 'pending',
    });
    const processingOrders = await this.orderModel.countDocuments({
      status: 'processing',
    });
    const shippedOrders = await this.orderModel.countDocuments({
      status: 'shipped',
    });
    const deliveredOrders = await this.orderModel.countDocuments({
      status: 'delivered',
    });

    // Calculate total revenue (sum of all order totals)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const revenueResult = (await this.orderModel.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ])) as Array<{ _id: null; total: number }>;
    const totalRevenue = revenueResult[0]?.total || 0;

    // Recent users
    const recentUsers = await this.userModel
      .find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    return {
      stats: {
        totalUsers,
        totalOrders,
        totalRevenue,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
      },
      recentUsers,
    };
  }

  // User Management
  async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const users = await this.userModel
      .find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this.userModel.countDocuments();

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    const userOrders = await this.orderModel
      .find({ userId })
      .sort({ createdAt: -1 });

    return {
      user,
      orders: userOrders,
      orderCount: userOrders.length,
      totalSpent: userOrders.reduce(
        (sum, order) =>
          (order.status as string) !== 'cancelled'
            ? sum + order.totalAmount
            : sum,
        0,
      ),
    };
  }

  async deleteUser(userId: string) {
    return await this.userModel.findByIdAndDelete(userId);
  }

  // Order Management
  async getAllOrders(page: number = 1, limit: number = 10, status?: string) {
    const skip = (page - 1) * limit;
    const query = status ? { status } : {};

    const orders = await this.orderModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this.orderModel.countDocuments(query);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (order) {
      const user = await this.userModel
        .findById(order.userId)
        .select('-password');
      return {
        order,
        user,
      };
    }
    return null;
  }

  async updateOrderStatus(
    orderId: string,
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  ) {
    return await this.orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true },
    );
  }

  async deleteOrder(orderId: string) {
    return await this.orderModel.findByIdAndDelete(orderId);
  }

  // Analytics
  async getRevenueAnalytics() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Revenue by day for last 30 days
    const dailyRevenue = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Total revenue by order status
    const revenueByStatus = await this.orderModel.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$status',
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      dailyRevenue,
      revenueByStatus,
    };
  }

  async getOrderAnalytics() {
    // Orders by status
    const ordersByStatus = await this.orderModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Average order value
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const avgOrderValue = (await this.orderModel.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          avgValue: { $avg: '$totalAmount' },
        },
      },
    ])) as Array<{ _id: null; avgValue: number }>;

    return {
      ordersByStatus,
      averageOrderValue: avgOrderValue[0]?.avgValue || 0,
    };
  }
}
