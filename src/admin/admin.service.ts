import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Order } from '../orders/schemas/order.schema';
import { Product } from '../products/schemas/product.schema';
import { Payment } from '../payments/schemas/payment.schema';
import { Newsletter } from '../newsletter/schemas/newsletter.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(Newsletter.name) private newsletterModel: Model<Newsletter>,
  ) {}

  // Enhanced Dashboard Statistics
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    // Basic counts
    const totalUsers = await this.userModel.countDocuments();
    const totalProducts = await this.productModel.countDocuments();
    const totalOrders = await this.orderModel.countDocuments();
    const totalSubscribers = await this.newsletterModel.countDocuments({
      isActive: true,
    });

    // Order status counts
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
    const cancelledOrders = await this.orderModel.countDocuments({
      status: 'cancelled',
    });

    // Revenue calculations
    const revenueResult = await this.orderModel.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = (revenueResult[0] as { total: number })?.total || 0;

    // Today's revenue
    const todayRevenueResult = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          status: { $ne: 'cancelled' },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const todayRevenue =
      (todayRevenueResult[0] as { total: number })?.total || 0;

    // Last 7 days revenue
    const weekRevenueResult = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days },
          status: { $ne: 'cancelled' },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const weekRevenue = (weekRevenueResult[0] as { total: number })?.total || 0;

    // Last 30 days revenue
    const monthRevenueResult = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: last30Days },
          status: { $ne: 'cancelled' },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const monthRevenue =
      (monthRevenueResult[0] as { total: number })?.total || 0;

    // Today's orders
    const todayOrders = await this.orderModel.countDocuments({
      createdAt: { $gte: today },
    });

    // Recent orders (last 10)
    const recentOrders = await this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('_id totalAmount status customerEmail createdAt')
      .lean();

    // Recent users (last 5)
    const recentUsers = await this.userModel
      .find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Low stock products
    const lowStockProducts = await this.productModel
      .find({
        stock: { $lte: 10, $gt: 0 },
      })
      .select('name stock price')
      .sort({ stock: 1 })
      .limit(10)
      .lean();

    // Out of stock products
    const outOfStockProducts = await this.productModel.countDocuments({
      stock: 0,
    });

    // Payment statistics
    const totalPayments = await this.paymentModel.countDocuments();
    const successfulPayments = await this.paymentModel.countDocuments({
      status: 'success',
    });
    const pendingPayments = await this.paymentModel.countDocuments({
      status: 'pending',
    });

    // Calculate growth percentages (simplified - comparing to previous period)
    const previousMonthRevenue = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth, $lt: last30Days },
          status: { $ne: 'cancelled' },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const prevMonthRevenue =
      (previousMonthRevenue[0] as { total: number })?.total || 0;
    const revenueGrowth =
      prevMonthRevenue > 0
        ? ((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
        : 0;

    return {
      stats: {
        // Overview
        totalUsers,
        totalProducts,
        totalOrders,
        totalSubscribers,
        totalRevenue,

        // Revenue breakdown
        todayRevenue,
        weekRevenue,
        monthRevenue,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,

        // Order status
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        todayOrders,

        // Product status
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts,

        // Payment status
        totalPayments,
        successfulPayments,
        pendingPayments,
        paymentSuccessRate:
          totalPayments > 0
            ? Math.round((successfulPayments / totalPayments) * 100)
            : 0,
      },
      recentOrders,
      recentUsers,
      lowStockProducts,
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

  // ==================== PRODUCT MANAGEMENT ====================
  async getAllProducts(
    page: number = 1,
    limit: number = 10,
    category?: string,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await this.productModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await this.productModel.countDocuments(query);

    // Add stock status to each product
    const productsWithStatus = products.map((product) => ({
      ...product,
      stockStatus:
        product.stock === 0
          ? 'out_of_stock'
          : product.stock <= 10
            ? 'low_stock'
            : 'in_stock',
    }));

    return {
      products: productsWithStatus,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(productId: string) {
    const product = await this.productModel.findById(productId).lean();
    if (!product) {
      return null;
    }

    // Get orders for this product
    const productOrders = await this.orderModel
      .find({ 'items.productId': productId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const totalSold = await this.orderModel.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.productId': productId } },
      { $group: { _id: null, total: { $sum: '$items.quantity' } } },
    ]);

    return {
      product: {
        ...product,
        stockStatus:
          product.stock === 0
            ? 'out_of_stock'
            : product.stock <= 10
              ? 'low_stock'
              : 'in_stock',
      },
      orders: productOrders,
      totalSold: (totalSold[0] as { total: number })?.total || 0,
    };
  }

  async getProductStats() {
    const totalProducts = await this.productModel.countDocuments();
    const inStock = await this.productModel.countDocuments({
      stock: { $gt: 10 },
    });
    const lowStock = await this.productModel.countDocuments({
      stock: { $lte: 10, $gt: 0 },
    });
    const outOfStock = await this.productModel.countDocuments({
      stock: 0,
    });

    const productsByCategory = await this.productModel.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalInventoryValue = await this.productModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ['$stock', '$price'] } },
        },
      },
    ]);

    return {
      totalProducts,
      inStock,
      lowStock,
      outOfStock,
      byCategory: productsByCategory,
      totalInventoryValue:
        (totalInventoryValue[0] as { total: number })?.total || 0,
    };
  }

  // ==================== NEWSLETTER MANAGEMENT ====================
  async getAllNewsletterSubscribers(
    page: number = 1,
    limit: number = 50,
    activeOnly: boolean = true,
  ) {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};

    if (activeOnly) {
      query.isActive = true;
    }

    const subscribers = await this.newsletterModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await this.newsletterModel.countDocuments(query);

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

  async getNewsletterStats() {
    const totalSubscribers = await this.newsletterModel.countDocuments();
    const activeSubscribers = await this.newsletterModel.countDocuments({
      isActive: true,
    });
    const inactiveSubscribers = await this.newsletterModel.countDocuments({
      isActive: false,
    });

    // Recent subscribers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSubscribers = await this.newsletterModel.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      isActive: true,
    });

    return {
      totalSubscribers,
      activeSubscribers,
      inactiveSubscribers,
      recentSubscribers,
    };
  }

  async deleteNewsletterSubscriber(email: string) {
    return await this.newsletterModel.findOneAndDelete({ email });
  }

  // ==================== ENHANCED ANALYTICS ====================
  async getSalesAnalytics(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Sales by day
    const salesByDay = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top selling products
    const topProducts = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    // Sales by category
    const salesByCategory = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' },
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          revenue: { $sum: '$items.subtotal' },
          orders: { $sum: 1 },
        },
      },
    ]);

    return {
      salesByDay,
      topProducts,
      salesByCategory,
      period: {
        days,
        startDate,
        endDate: new Date(),
      },
    };
  }
}
