import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SupportTicketStatus } from '../entities/support-ticket.entity';

export class UpdateTicketStatusDto {
  @ApiProperty({
    description: 'New ticket status',
    enum: SupportTicketStatus,
    example: SupportTicketStatus.IN_PROGRESS,
  })
  @IsEnum(SupportTicketStatus)
  status: SupportTicketStatus;
}

