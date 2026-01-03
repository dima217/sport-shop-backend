import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../entities/order.entity';

class DeliveryAddressDto {
  @ApiProperty({ description: 'Street address', example: 'ул. Ленина, д. 10' })
  @IsNotEmpty()
  @IsString()
  street: string;

  @ApiProperty({ description: 'City', example: 'Москва' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ description: 'Postal code', example: '123456' })
  @IsNotEmpty()
  @IsString()
  postalCode: string;

  @ApiProperty({ description: 'Country', example: 'Россия' })
  @IsNotEmpty()
  @IsString()
  country: string;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Delivery address', type: DeliveryAddressDto })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  deliveryAddress: DeliveryAddressDto;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Order comment', nullable: true, required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
