import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  Min,
  Max,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class UpdateReviewDto {
  @ApiProperty({
    description: 'Rating from 1 to 5 (optional)',
    example: 4,
    minimum: 1,
    maximum: 5,
    required: false,
  })
  @IsOptional()
  @ValidateIf((o) => o.rating !== undefined)
  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  rating?: number;

  @ApiProperty({
    description: 'Review comment text (10-2000 characters, optional)',
    example: 'Обновленный комментарий',
    minLength: 10,
    maxLength: 2000,
    required: false,
  })
  @IsOptional()
  @ValidateIf((o) => o.comment !== undefined)
  @IsString({ message: 'Comment must be a string' })
  @MinLength(10, { message: 'Comment must be at least 10 characters long' })
  @MaxLength(2000, { message: 'Comment must not exceed 2000 characters' })
  comment?: string;
}

