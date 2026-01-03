import { ApiProperty } from '@nestjs/swagger';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('favorites')
export class Favorite {
  @ApiProperty({ description: 'User ID' })
  @PrimaryColumn('int')
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ description: 'Product ID' })
  @PrimaryColumn('uuid')
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ApiProperty({ description: 'Date when product was added to favorites' })
  @CreateDateColumn()
  createdAt: Date;
}
