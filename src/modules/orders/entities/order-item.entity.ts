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

  @ApiProperty({
    description: 'Product ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column('uuid')
  productId: string;

  @ApiProperty({
    description: 'Product details (optional, may not be included in all responses)',
    type: Product,
    required: false,
  })
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @ApiProperty({ description: 'Quantity of items in this order item', example: 2, minimum: 1 })
  @Column('int')
  quantity: number;

  @ApiProperty({
    description: 'Selected size (if applicable, null if product has no sizes)',
    nullable: true,
    example: 'M',
    required: false,
  })
  @Column({ type: 'varchar', nullable: true })
  size: string | null;

  @ApiProperty({
    description: 'Selected color (if applicable, null if product has no colors)',
    nullable: true,
    example: 'Черный',
    required: false,
  })
  @Column({ type: 'varchar', nullable: true })
  color: string | null;

  @ApiProperty({
    description: 'Price per item at the time of order (in rubles)',
    example: 2990,
  })
  @Column('int')
  price: number;
}
