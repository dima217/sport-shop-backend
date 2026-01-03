import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class Category {
  @ApiProperty({ description: 'Unique category identifier (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Category name', example: 'Одежда' })
  @Column()
  name: string;

  @ApiProperty({ description: 'URL of category image', example: 'https://example.com/image.jpg' })
  @Column()
  image: string;

  @ApiProperty({ description: 'URL-friendly identifier', example: 'odezhda' })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({ description: 'Parent category ID (for nested categories)', nullable: true })
  @Column({ type: 'uuid', nullable: true })
  parentId: string | null;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
