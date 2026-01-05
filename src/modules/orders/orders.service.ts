import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private cartService: CartService,
    private dataSource: DataSource,
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
}
