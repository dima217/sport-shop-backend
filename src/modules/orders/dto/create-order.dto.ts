import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../entities/order.entity';

export class DeliveryAddressDto {
  @ApiProperty({
    description: 'Street address with apartment number',
    example: 'ул. Ленина, д. 10, кв. 25',
    required: true,
  })
  @IsNotEmpty({ message: 'Street is required' })
  @IsString()
  street: string;

  @ApiProperty({ description: 'City name', example: 'Москва', required: true })
  @IsNotEmpty({ message: 'City is required' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'Postal/ZIP code', example: '123456', required: true })
  @IsNotEmpty({ message: 'Postal code is required' })
  @IsString()
  postalCode: string;

  @ApiProperty({ description: 'Country name', example: 'Россия', required: true })
  @IsNotEmpty({ message: 'Country is required' })
  @IsString()
  country: string;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Delivery address information',
    type: DeliveryAddressDto,
    required: true,
  })
  @IsNotEmpty({ message: 'Delivery address is required' })
  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  deliveryAddress: DeliveryAddressDto;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.CARD,
    required: true,
  })
  @IsNotEmpty({ message: 'Payment method is required' })
  @IsEnum(PaymentMethod, { message: 'Payment method must be either "card" or "cash"' })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Additional order comment or notes',
    example: 'Позвоните за час до доставки',
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string | null;
}
