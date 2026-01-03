import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @ApiProperty({ description: 'Unique order item identifier (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Order ID' })
  @Column('uuid')
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ApiProperty({ description: 'Product ID' })
  @Column('uuid')
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ApiProperty({ description: 'Quantity of items', example: 2 })
  @Column('int')
  quantity: number;

  @ApiProperty({ description: 'Selected size (if applicable)', nullable: true })
  @Column({ type: 'varchar', nullable: true })
  size: string | null;

  @ApiProperty({ description: 'Selected color (if applicable)', nullable: true })
  @Column({ type: 'varchar', nullable: true })
  color: string | null;

  @ApiProperty({ description: 'Price at the time of order', example: 8990 })
  @Column('int')
  price: number;
}
