import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CARD = 'card',
  CASH = 'cash',
}

@Entity('orders')
export class Order {
  @ApiProperty({ description: 'Unique order identifier (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User ID' })
  @Column('int')
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    description: 'Order status',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
    default: OrderStatus.PENDING,
  })
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @ApiProperty({
    description: 'Delivery address - street',
    example: 'ул. Ленина, д. 10, кв. 25',
  })
  @Column()
  deliveryStreet: string;

  @ApiProperty({ description: 'Delivery address - city', example: 'Москва' })
  @Column()
  deliveryCity: string;

  @ApiProperty({ description: 'Delivery address - postal code', example: '123456' })
  @Column()
  deliveryPostalCode: string;

  @ApiProperty({ description: 'Delivery address - country', example: 'Россия' })
  @Column()
  deliveryCountry: string;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.CARD,
  })
  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Order comment or additional notes',
    nullable: true,
    example: 'Позвоните за час до доставки',
    required: false,
  })
  @Column('text', { nullable: true })
  comment: string | null;

  @ApiProperty({
    description: 'Total order amount in rubles (integer, e.g., 8990 = 8990 руб)',
    example: 12980,
  })
  @Column('int')
  total: number;

  @ApiProperty({
    description: 'Order items (optional, may not be included in all responses)',
    type: [OrderItem],
    required: false,
  })
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items?: OrderItem[];

  @ApiProperty({
    description: 'Date when order was created (ISO 8601 format)',
    example: '2024-01-15T10:30:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;
}
