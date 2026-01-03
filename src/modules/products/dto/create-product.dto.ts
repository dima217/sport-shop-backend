import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUUID,
  Min,
  ArrayMinSize,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Футбольный мяч Adidas' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Product description' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Current price in rubles', example: 8990 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Old price in rubles (optional)', nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  oldPrice?: number | null;

  @ApiProperty({ description: 'Array of product image URLs', type: [String] })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  images: string[];

  @ApiProperty({ description: 'Category ID' })
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @ApiProperty({ description: 'Is product in stock', default: true })
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @ApiProperty({ description: 'Stock quantity', nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number | null;

  @ApiProperty({ description: 'Available sizes', type: [String], nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sizes?: string[] | null;

  @ApiProperty({ description: 'Available colors', type: [String], nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colors?: string[] | null;

  @ApiProperty({ description: 'Product brand', nullable: true })
  @IsOptional()
  @IsString()
  brand?: string | null;

  @ApiProperty({ description: 'Product SKU', example: 'AD-12345' })
  @IsNotEmpty()
  @IsString()
  sku: string;
}
