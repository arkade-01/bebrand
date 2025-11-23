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

  // Order Management with Advanced Filtering
  async getAllOrders(
    page: number = 1,
    limit: number = 10,
    status?: string,
    startDate?: string,
    endDate?: string,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};

    // Status filter
    if (status) {
      query.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      const dateQuery: Record<string, Date> = {};
      if (startDate) dateQuery.$gte = new Date(startDate);
      if (endDate) dateQuery.$lte = new Date(endDate);
      query.createdAt = dateQuery;
    }

    // Search by email or order ID
    if (search) {
      query.$or = [
        { 'guestInfo.email': { $regex: search, $options: 'i' } },
        { _id: search },
      ];
    }

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

  // CSV Export for Orders
  async exportOrdersToCSV(
    status?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<string> {
    const query: Record<string, unknown> = {};

    if (status) query.status = status;

    if (startDate || endDate) {
      const dateQuery: Record<string, Date> = {};
      if (startDate) dateQuery.$gte = new Date(startDate);
      if (endDate) dateQuery.$lte = new Date(endDate);
      query.createdAt = dateQuery;
    }

    const orders = await this.orderModel.find(query).sort({ createdAt: -1 });

    // CSV Headers
    const headers = [
      'Order ID',
      'Customer Name',
      'Customer Email',
      'Phone',
      'Status',
      'Total Amount',
      'Payment Status',
      'Items Count',
      'Shipping Address',
      'Created At',
    ];

    // CSV Rows
    const rows = orders.map((order) => {
      const guestInfo = order.guestInfo as {
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
      };
      const shippingAddr = order.shippingAddress as {
        address?: string;
        city?: string;
        state?: string;
        country?: string;
      };

      return [
        String(order._id),
        guestInfo
          ? `${guestInfo.firstName || ''} ${guestInfo.lastName || ''}`.trim()
          : 'N/A',
        guestInfo?.email || 'N/A',
        guestInfo?.phone || 'N/A',
        order.status,
        order.totalAmount.toFixed(2),
        String(order.paymentStatus || 'N/A'),
        order.items.length.toString(),
        `${shippingAddr.address || ''}, ${shippingAddr.city || ''}, ${shippingAddr.state || ''}, ${shippingAddr.country || ''}`,
        new Date(order.createdAt).toISOString(),
      ];
    });

    // Combine headers and rows
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      )
      .join('\n');

    return csv;
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
