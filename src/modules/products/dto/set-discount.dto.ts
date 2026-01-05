import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class SetDiscountDto {
  @ApiProperty({
    description: 'Discount percentage (0-100)',
    example: 25,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent: number;

  @ApiProperty({
    description: 'Old price in rubles (optional, will be calculated from discountPercent if not provided)',
    example: 10990,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  oldPrice?: number;
}

