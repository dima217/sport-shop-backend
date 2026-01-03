import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity('products')
export class Product {
  @ApiProperty({ description: 'Unique product identifier (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Product name', example: 'Футбольный мяч Adidas' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Product description', example: 'Профессиональный футбольный мяч' })
  @Column('text')
  description: string;

  @ApiProperty({ description: 'Current price in rubles', example: 8990 })
  @Column('int')
  price: number;

  @ApiProperty({ description: 'Old price in rubles (for discounts)', nullable: true })
  @Column('int', { nullable: true })
  oldPrice: number | null;

  @ApiProperty({ description: 'Array of product image URLs', type: [String] })
  @Column('text', { array: true, default: [] })
  images: string[];

  @ApiProperty({ description: 'Category ID' })
  @Column('uuid')
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ApiProperty({ description: 'Average rating (0-5)', nullable: true })
  @Column('decimal', { precision: 3, scale: 2, nullable: true, default: null })
  rating: number | null;

  @ApiProperty({ description: 'Number of reviews', default: 0 })
  @Column('int', { default: 0 })
  reviewCount: number;

  @ApiProperty({ description: 'Is product in stock', default: true })
  @Column('boolean', { default: true })
  inStock: boolean;

  @ApiProperty({ description: 'Stock quantity', nullable: true })
  @Column('int', { nullable: true })
  stockQuantity: number | null;

  @ApiProperty({ description: 'Available sizes', type: [String], nullable: true })
  @Column('text', { array: true, nullable: true })
  sizes: string[] | null;

  @ApiProperty({ description: 'Available colors', type: [String], nullable: true })
  @Column('text', { array: true, nullable: true })
  colors: string[] | null;

  @ApiProperty({ description: 'Product brand', nullable: true })
  @Column({ type: 'varchar', nullable: true })
  brand: string | null;

  @ApiProperty({ description: 'Product SKU', example: 'AD-12345' })
  @Column({ unique: true })
  sku: string;

  @ApiProperty({ description: 'Date of creation' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date of last update' })
  @UpdateDateColumn()
  updatedAt: Date;
}
