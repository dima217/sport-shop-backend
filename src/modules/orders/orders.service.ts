import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CartService } from '../cart/cart.service';
import { AppWebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private cartService: CartService,
    private dataSource: DataSource,
    private webSocketGateway: AppWebSocketGateway,
  ) {}

  async create(userId: number, createOrderDto: CreateOrderDto): Promise<Order> {
    // Get user cart
    const cart = await this.cartService.getCart(userId);

    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Create order in transaction
    const savedOrder = await this.dataSource.transaction(async (manager) => {
      const order = manager.create(Order, {
        userId,
        status: OrderStatus.PENDING,
        deliveryStreet: createOrderDto.deliveryAddress.street,
        deliveryCity: createOrderDto.deliveryAddress.city,
        deliveryPostalCode: createOrderDto.deliveryAddress.postalCode,
        deliveryCountry: createOrderDto.deliveryAddress.country,
        paymentMethod: createOrderDto.paymentMethod,
        comment: createOrderDto.comment ?? null,
        total: cart.total,
      });

      const savedOrder = await manager.save(order);

      // Create order items from cart items
      const orderItems = cart.items.map((cartItem) =>
        manager.create(OrderItem, {
          orderId: savedOrder.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          size: cartItem.size,
          color: cartItem.color,
          price: cartItem.price,
        }),
      );

      await manager.save(orderItems);

      // Clear cart
      await this.cartService.clearCart(userId);

      return savedOrder;
    });

    // Return order with items (load after transaction)
    return this.findOne(savedOrder.id);
  }

  async findAll(userId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items', 'items.product', 'items.product.category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'items.product.category'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findAllAdmin(
    status?: OrderStatus,
    limit = 20,
    offset = 0,
    sortBy: 'createdAt' | 'total' = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{ orders: Order[]; total: number; limit: number; offset: number }> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile');

    if (status) {
      queryBuilder.where('order.status = :status', { status });
    }

    // Get total count before pagination
    const total = await queryBuilder.getCount();

    // Apply sorting
    if (sortBy === 'total') {
      queryBuilder.orderBy('order.total', sortOrder.toUpperCase() as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy('order.createdAt', sortOrder.toUpperCase() as 'ASC' | 'DESC');
    }

    // Apply pagination
    queryBuilder.skip(offset).take(limit);

    const orders = await queryBuilder.getMany();

    return {
      orders,
      total,
      limit,
      offset,
    };
  }

  async updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);
    const oldStatus = order.status;

    order.status = updateStatusDto.status;
    await this.orderRepository.save(order);

    const updatedOrder = await this.findOne(id);

    // Emit WebSocket event for order status update
    this.webSocketGateway.emitOrderStatusUpdated(
      id,
      oldStatus,
      updateStatusDto.status,
      updatedOrder,
    );

    return updatedOrder;
  }
}
