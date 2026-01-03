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

  @ApiProperty({ description: 'Order status', enum: OrderStatus })
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @ApiProperty({ description: 'Delivery address - street' })
  @Column()
  deliveryStreet: string;

  @ApiProperty({ description: 'Delivery address - city' })
  @Column()
  deliveryCity: string;

  @ApiProperty({ description: 'Delivery address - postal code' })
  @Column()
  deliveryPostalCode: string;

  @ApiProperty({ description: 'Delivery address - country' })
  @Column()
  deliveryCountry: string;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Order comment', nullable: true })
  @Column('text', { nullable: true })
  comment: string | null;

  @ApiProperty({ description: 'Total order amount in rubles' })
  @Column('int')
  total: number;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];

  @ApiProperty({ description: 'Date when order was created' })
  @CreateDateColumn()
  createdAt: Date;
}
