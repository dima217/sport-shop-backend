import { ApiProperty } from '@nestjs/swagger';
import { SupportTicketStatus } from '../entities/support-ticket.entity';

export class SupportTicketResponseDto {
  @ApiProperty({ description: 'Ticket ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'User ID who created the ticket', example: 1 })
  userId: number;

  @ApiProperty({ description: 'Ticket subject', example: 'Проблема с заказом #12345' })
  subject: string;

  @ApiProperty({
    description: 'Ticket message/description',
    example: 'Мой заказ не был доставлен в указанное время',
  })
  message: string;

  @ApiProperty({
    description: 'Ticket status',
    enum: SupportTicketStatus,
    example: SupportTicketStatus.OPEN,
  })
  status: SupportTicketStatus;

  @ApiProperty({
    description: 'Admin response to the ticket',
    nullable: true,
    example: 'Спасибо за обращение. Мы проверим ваш заказ.',
  })
  adminResponse: string | null;

  @ApiProperty({ description: 'Date when ticket was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when ticket was last updated' })
  updatedAt: Date;
}
