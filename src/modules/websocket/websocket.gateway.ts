import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';

export enum WebSocketEvent {
  // Product events
  PRODUCT_CREATED = 'product:created',
  PRODUCT_UPDATED = 'product:updated',
  PRODUCT_PRICE_CHANGED = 'product:price_changed',
  PRODUCT_DISCOUNT_APPLIED = 'product:discount_applied',
  PRODUCT_DISCOUNT_REMOVED = 'product:discount_removed',
  PRODUCT_STOCK_CHANGED = 'product:stock_changed',
  PRODUCT_DELETED = 'product:deleted',

  // Category events
  CATEGORY_CREATED = 'category:created',
  CATEGORY_UPDATED = 'category:updated',
  CATEGORY_DELETED = 'category:deleted',

  // Order events
  ORDER_STATUS_UPDATED = 'order:status_updated',
}

export interface ProductEventPayload {
  product: Product;
  timestamp: string;
}

export interface CategoryEventPayload {
  category: Category;
  timestamp: string;
}

export interface PriceChangePayload {
  productId: string;
  oldPrice: number;
  newPrice: number;
  product: Product;
  timestamp: string;
}

export interface DiscountPayload {
  productId: string;
  discountPercent: number;
  oldPrice: number;
  newPrice: number;
  product: Product;
  timestamp: string;
}

export interface StockChangePayload {
  productId: string;
  oldStock: number;
  newStock: number;
  inStock: boolean;
  product: Product;
  timestamp: string;
}

export interface OrderStatusUpdatePayload {
  orderId: string;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  order: Order;
  timestamp: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/',
})
export class AppWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppWebSocketGateway.name);

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Emit product created event to all connected clients
   */
  emitProductCreated(product: Product): void {
    const payload: ProductEventPayload = {
      product,
      timestamp: new Date().toISOString(),
    };
    this.server.emit(WebSocketEvent.PRODUCT_CREATED, payload);
    this.logger.log(`Product created event emitted: ${product.id}`);
  }

  /**
   * Emit product updated event to all connected clients
   */
  emitProductUpdated(product: Product): void {
    const payload: ProductEventPayload = {
      product,
      timestamp: new Date().toISOString(),
    };
    this.server.emit(WebSocketEvent.PRODUCT_UPDATED, payload);
    this.logger.log(`Product updated event emitted: ${product.id}`);
  }

  /**
   * Emit product price changed event to all connected clients
   */
  emitProductPriceChanged(
    productId: string,
    oldPrice: number,
    newPrice: number,
    product: Product,
  ): void {
    const payload: PriceChangePayload = {
      productId,
      oldPrice,
      newPrice,
      product,
      timestamp: new Date().toISOString(),
    };
    this.server.emit(WebSocketEvent.PRODUCT_PRICE_CHANGED, payload);
    this.logger.log(
      `Product price changed event emitted: ${productId} (${oldPrice} -> ${newPrice})`,
    );
  }

  /**
   * Emit product discount applied event to all connected clients
   */
  emitProductDiscountApplied(
    productId: string,
    discountPercent: number,
    oldPrice: number,
    newPrice: number,
    product: Product,
  ): void {
    const payload: DiscountPayload = {
      productId,
      discountPercent,
      oldPrice,
      newPrice,
      product,
      timestamp: new Date().toISOString(),
    };
    this.server.emit(WebSocketEvent.PRODUCT_DISCOUNT_APPLIED, payload);
    this.logger.log(`Product discount applied event emitted: ${productId} (${discountPercent}%)`);
  }

  /**
   * Emit product discount removed event to all connected clients
   */
  emitProductDiscountRemoved(
    productId: string,
    oldPrice: number,
    newPrice: number,
    product: Product,
  ): void {
    const payload: DiscountPayload = {
      productId,
      discountPercent: 0,
      oldPrice,
      newPrice,
      product,
      timestamp: new Date().toISOString(),
    };
    this.server.emit(WebSocketEvent.PRODUCT_DISCOUNT_REMOVED, payload);
    this.logger.log(`Product discount removed event emitted: ${productId}`);
  }

  /**
   * Emit product stock changed event to all connected clients
   */
  emitProductStockChanged(
    productId: string,
    oldStock: number,
    newStock: number,
    inStock: boolean,
    product: Product,
  ): void {
    const payload: StockChangePayload = {
      productId,
      oldStock,
      newStock,
      inStock,
      product,
      timestamp: new Date().toISOString(),
    };
    this.server.emit(WebSocketEvent.PRODUCT_STOCK_CHANGED, payload);
    this.logger.log(
      `Product stock changed event emitted: ${productId} (${oldStock} -> ${newStock})`,
    );
  }

  /**
   * Emit product deleted event to all connected clients
   */
  emitProductDeleted(productId: string): void {
    this.server.emit(WebSocketEvent.PRODUCT_DELETED, {
      productId,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Product deleted event emitted: ${productId}`);
  }

  /**
   * Emit category created event to all connected clients
   */
  emitCategoryCreated(category: Category): void {
    const payload: CategoryEventPayload = {
      category,
      timestamp: new Date().toISOString(),
    };
    this.server.emit(WebSocketEvent.CATEGORY_CREATED, payload);
    this.logger.log(`Category created event emitted: ${category.id}`);
  }

  /**
   * Emit category updated event to all connected clients
   */
  emitCategoryUpdated(category: Category): void {
    const payload: CategoryEventPayload = {
      category,
      timestamp: new Date().toISOString(),
    };
    this.server.emit(WebSocketEvent.CATEGORY_UPDATED, payload);
    this.logger.log(`Category updated event emitted: ${category.id}`);
  }

  /**
   * Emit category deleted event to all connected clients
   */
  emitCategoryDeleted(categoryId: string): void {
    this.server.emit(WebSocketEvent.CATEGORY_DELETED, {
      categoryId,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Category deleted event emitted: ${categoryId}`);
  }

  /**
   * Emit order status updated event to all connected clients
   */
  emitOrderStatusUpdated(
    orderId: string,
    oldStatus: OrderStatus,
    newStatus: OrderStatus,
    order: Order,
  ): void {
    const payload: OrderStatusUpdatePayload = {
      orderId,
      oldStatus,
      newStatus,
      order,
      timestamp: new Date().toISOString(),
    };
    this.server.emit(WebSocketEvent.ORDER_STATUS_UPDATED, payload);
    this.logger.log(
      `Order status updated event emitted: ${orderId} (${oldStatus} -> ${newStatus})`,
    );
  }
}
