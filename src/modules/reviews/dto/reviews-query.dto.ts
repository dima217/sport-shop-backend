import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export enum ReviewSortBy {
  CREATED_AT = 'createdAt',
  RATING = 'rating',
}

export enum ReviewSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class ReviewsQueryDto {
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
  @IsInt()
  @Min(1)
  @Max(100)
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
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiProperty({
    description: 'Field to sort by',
    enum: ReviewSortBy,
    required: false,
    default: ReviewSortBy.CREATED_AT,
    example: ReviewSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(ReviewSortBy)
  sortBy?: ReviewSortBy;

  @ApiProperty({
    description: 'Sort order',
    enum: ReviewSortOrder,
    required: false,
    default: ReviewSortOrder.DESC,
    example: ReviewSortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(ReviewSortOrder)
  sortOrder?: ReviewSortOrder;

  @ApiProperty({
    description: 'Filter by rating (1-5)',
    required: false,
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
}

