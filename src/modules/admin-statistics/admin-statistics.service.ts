import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class AdminStatisticsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getGeneralStatistics() {
    // Orders statistics
    const totalOrders = await this.orderRepository.count();
    const ordersByStatus = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('order.status')
      .getRawMany();

    const ordersStats = {
      total: totalOrders,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    ordersByStatus.forEach((item) => {
      ordersStats[item.status as keyof typeof ordersStats] = parseInt(item.count, 10);
    });

    // Products statistics
    const totalProducts = await this.productRepository.count();
    const inStockProducts = await this.productRepository.count({
      where: { inStock: true },
    });
    const outOfStockProducts = await this.productRepository.count({
      where: { inStock: false },
    });
    const lowStockProducts = await this.productRepository.count({
      where: { inStock: true },
    });

    // Get products with stock quantity <= 10
    const lowStockCount = await this.productRepository
      .createQueryBuilder('product')
      .where('product.inStock = :inStock', { inStock: true })
      .andWhere('product.stockQuantity <= :threshold', { threshold: 10 })
      .getCount();

    // Revenue statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    monthAgo.setHours(0, 0, 0, 0);

    const revenueToday = await this.orderRepository
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.total), 0)', 'total')
      .where('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .andWhere('order.createdAt >= :today', { today })
      .getRawOne();

    const revenueWeek = await this.orderRepository
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.total), 0)', 'total')
      .where('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .andWhere('order.createdAt >= :weekAgo', { weekAgo })
      .getRawOne();

    const revenueMonth = await this.orderRepository
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.total), 0)', 'total')
      .where('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .andWhere('order.createdAt >= :monthAgo', { monthAgo })
      .getRawOne();

    const revenueTotal = await this.orderRepository
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.total), 0)', 'total')
      .where('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .getRawOne();

    // Categories count
    const totalCategories = await this.categoryRepository.count();

    return {
      orders: ordersStats,
      products: {
        total: totalProducts,
        inStock: inStockProducts,
        outOfStock: outOfStockProducts,
        lowStock: lowStockCount,
      },
      revenue: {
        today: parseInt(revenueToday?.total || '0', 10),
        week: parseInt(revenueWeek?.total || '0', 10),
        month: parseInt(revenueMonth?.total || '0', 10),
        total: parseInt(revenueTotal?.total || '0', 10),
      },
      categories: {
        total: totalCategories,
      },
    };
  }

  async getProductsStatistics(period: 'day' | 'week' | 'month' | 'year' = 'month') {
    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Top products by sales (from order items)
    const topProducts = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.items', 'item')
      .innerJoin('item.product', 'product')
      .select('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('SUM(item.quantity)', 'salesCount')
      .addSelect('SUM(item.price * item.quantity)', 'revenue')
      .where('order.createdAt >= :startDate', { startDate })
      .andWhere('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('salesCount', 'DESC')
      .limit(10)
      .getRawMany();

    // Low stock products (stockQuantity <= 10)
    const lowStock = await this.productRepository
      .createQueryBuilder('product')
      .where('product.inStock = :inStock', { inStock: true })
      .andWhere('product.stockQuantity <= :threshold', { threshold: 10 })
      .orderBy('product.stockQuantity', 'ASC')
      .limit(20)
      .getMany();

    // Out of stock products
    const outOfStock = await this.productRepository
      .createQueryBuilder('product')
      .where('product.inStock = :inStock', { inStock: false })
      .orWhere('product.stockQuantity = :zero', { zero: 0 })
      .orderBy('product.updatedAt', 'DESC')
      .limit(20)
      .getMany();

    return {
      topProducts: topProducts.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        salesCount: parseInt(item.salesCount || '0', 10),
        revenue: parseInt(item.revenue || '0', 10),
      })),
      lowStock: lowStock.map((product) => ({
        productId: product.id,
        productName: product.name,
        stockQuantity: product.stockQuantity,
        inStock: product.inStock,
      })),
      outOfStock: outOfStock.map((product) => ({
        productId: product.id,
        productName: product.name,
        stockQuantity: product.stockQuantity || 0,
        inStock: product.inStock,
      })),
    };
  }
}

