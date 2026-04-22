import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
  IsArray,
  ArrayMinSize,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SortBy {
  PRICE = 'price',
  RATING = 'rating',
  NAME = 'name',
  CREATED_AT = 'createdAt',
  REVIEW_COUNT = 'reviewCount',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class ProductsQueryDto {
  @ApiProperty({
    description: 'Filter by category ID (UUID)',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description: 'Filter by category slug',
    required: false,
    example: 'odezhda',
  })
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiProperty({
    description: 'Search query - searches in name, description, brand, and SKU',
    required: false,
    example: 'Nike кроссовки',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Minimum price (in rubles)',
    required: false,
    example: 1000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({
    description: 'Maximum price (in rubles)',
    required: false,
    example: 10000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({
    description:
      'Filter by brands (array of brand names). Use query parameter multiple times: brands=Nike&brands=Adidas',
    required: false,
    example: ['Nike', 'Adidas'],
    type: [String],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  brands?: string[];

  @ApiProperty({
    description:
      'Filter by sizes (array of sizes). Use query parameter multiple times: sizes=M&sizes=L',
    required: false,
    example: ['M', 'L'],
    type: [String],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  sizes?: string[];

  @ApiProperty({
    description:
      'Filter by colors (array of colors). Use query parameter multiple times: colors=Черный&colors=Белый',
    required: false,
    example: ['Черный', 'Белый'],
    type: [String],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  colors?: string[];

  @ApiProperty({
    description: 'Minimum rating (0-5)',
    required: false,
    example: 4.0,
    minimum: 0,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minRating?: number;

  @ApiProperty({
    description: 'Only products in stock',
    required: false,
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  inStock?: boolean;

  @ApiProperty({
    description: 'Field to sort by',
    enum: SortBy,
    required: false,
    default: SortBy.CREATED_AT,
    example: SortBy.PRICE,
  })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy;

  @ApiProperty({
    description: 'Sort order',
    enum: SortOrder,
    required: false,
    default: SortOrder.DESC,
    example: SortOrder.ASC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiProperty({
    description: 'Number of results per page',
    required: false,
    default: 20,
    minimum: 1,
    maximum: 100,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiProperty({
    description: 'Offset for pagination (number of items to skip)',
    required: false,
    default: 0,
    minimum: 0,
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;

  @ApiProperty({
    description:
      'BCP-47 language code to translate product name and description (e.g. "en", "de", "zh"). ' +
      'Omit to receive the original text.',
    required: false,
    example: 'en',
  })
  @IsOptional()
  @IsString()
  @Length(2, 10)
  lang?: string;
}
