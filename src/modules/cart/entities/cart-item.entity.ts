import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('cart_items')
export class CartItem {
  @ApiProperty({ description: 'Unique cart item identifier (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User ID' })
  @Column('int')
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

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

  @ApiProperty({ description: 'Price at the time of adding to cart', example: 8990 })
  @Column('int')
  price: number;

  @ApiProperty({ description: 'Date when item was added to cart' })
  @CreateDateColumn()
  createdAt: Date;
}
