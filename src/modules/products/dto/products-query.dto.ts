import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortBy {
  PRICE = 'price',
  RATING = 'rating',
  NAME = 'name',
  CREATED_AT = 'createdAt',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class ProductsQueryDto {
  @ApiProperty({ description: 'Filter by category ID', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ description: 'Search by name/description', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Minimum price', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ description: 'Maximum price', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ description: 'Only products in stock', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  inStock?: boolean;

  @ApiProperty({ description: 'Field to sort by', enum: SortBy, required: false })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy;

  @ApiProperty({ description: 'Sort order', enum: SortOrder, required: false })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiProperty({ description: 'Number of results', required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiProperty({ description: 'Offset for pagination', required: false, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;
}
