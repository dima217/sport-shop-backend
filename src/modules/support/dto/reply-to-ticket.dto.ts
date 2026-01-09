import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class ReplyToTicketDto {
  @ApiProperty({
    description: 'Admin response to the ticket',
    example: 'Спасибо за обращение. Мы проверили ваш заказ и связались с курьером. Заказ будет доставлен сегодня до 18:00.',
    minLength: 10,
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  response: string;
}

