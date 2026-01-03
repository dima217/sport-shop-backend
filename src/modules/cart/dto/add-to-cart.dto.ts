import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, IsUUID } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Quantity (minimum 1)', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Selected size (optional)', nullable: true })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiProperty({ description: 'Selected color (optional)', nullable: true })
  @IsOptional()
  @IsString()
  color?: string;
}
