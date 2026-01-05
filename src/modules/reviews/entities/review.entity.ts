import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../user/entities/user.entity';

@Entity('reviews')
@Unique(['productId', 'userId']) // Один пользователь может оставить только один отзыв на товар
export class Review {
  @ApiProperty({ description: 'Unique review identifier (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Product ID (UUID)' })
  @Column('uuid')
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ApiProperty({ description: 'User ID' })
  @Column('int')
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    description: 'Rating from 1 to 5',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @Column('int')
  rating: number;

  @ApiProperty({
    description: 'Review comment text',
    example: 'Отличный товар! Очень доволен покупкой.',
    minLength: 10,
    maxLength: 2000,
  })
  @Column('text')
  comment: string;

  @ApiProperty({
    description: 'Date when review was created (ISO 8601 format)',
    example: '2024-01-15T10:30:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Date when review was last updated (ISO 8601 format)',
    example: '2024-01-15T11:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
