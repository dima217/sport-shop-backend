import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Rating from 1 to 5',
    example: 5,
    minimum: 1,
    maximum: 5,
    required: true,
  })
  @IsNotEmpty({ message: 'Rating is required' })
  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  rating: number;

  @ApiProperty({
    description: 'Review comment text (10-2000 characters)',
    example: 'Отличный товар! Очень доволен покупкой.',
    minLength: 10,
    maxLength: 2000,
    required: true,
  })
  @IsNotEmpty({ message: 'Comment is required' })
  @IsString({ message: 'Comment must be a string' })
  @MinLength(10, { message: 'Comment must be at least 10 characters long' })
  @MaxLength(2000, { message: 'Comment must not exceed 2000 characters' })
  comment: string;
}

