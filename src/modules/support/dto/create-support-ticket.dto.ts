import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateSupportTicketDto {
  @ApiProperty({
    description: 'Ticket subject',
    example: 'Проблема с заказом #12345',
    minLength: 5,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  subject: string;

  @ApiProperty({
    description: 'Ticket message/description',
    example: 'Мой заказ не был доставлен в указанное время. Пожалуйста, помогите разобраться.',
    minLength: 10,
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  message: string;
}

