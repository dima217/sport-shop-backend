import { ApiProperty } from '@nestjs/swagger';

export class ReviewUserDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'User first name', example: 'Иван' })
  firstName: string;

  @ApiProperty({ description: 'User last name', example: 'Иванов' })
  lastName: string;
}

export class ReviewResponseDto {
  @ApiProperty({ description: 'Review ID (UUID)' })
  id: string;

  @ApiProperty({ description: 'Product ID (UUID)' })
  productId: string;

  @ApiProperty({ description: 'User ID' })
  userId: number;

  @ApiProperty({ description: 'User information', type: ReviewUserDto })
  user: ReviewUserDto;

  @ApiProperty({ description: 'Rating from 1 to 5', example: 5 })
  rating: number;

  @ApiProperty({ description: 'Review comment', example: 'Отличный товар!' })
  comment: string;

  @ApiProperty({ description: 'Creation date (ISO 8601)', example: '2024-01-15T10:30:00.000Z' })
  createdAt: string;

  @ApiProperty({ description: 'Update date (ISO 8601)', example: '2024-01-15T11:00:00.000Z' })
  updatedAt: string;
}

