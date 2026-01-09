import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { SupportTicketStatus } from '../entities/support-ticket.entity';

export enum SupportTicketSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  STATUS = 'status',
}

export enum SupportTicketSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class SupportTicketQueryDto {
  @ApiPropertyOptional({
    description: 'Number of tickets to return',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Number of tickets to skip',
    example: 0,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({
    description: 'Filter by ticket status',
    enum: SupportTicketStatus,
    example: SupportTicketStatus.OPEN,
  })
  @IsOptional()
  @IsEnum(SupportTicketStatus)
  status?: SupportTicketStatus;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: SupportTicketSortBy,
    example: SupportTicketSortBy.CREATED_AT,
    default: SupportTicketSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(SupportTicketSortBy)
  sortBy?: SupportTicketSortBy = SupportTicketSortBy.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SupportTicketSortOrder,
    example: SupportTicketSortOrder.DESC,
    default: SupportTicketSortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SupportTicketSortOrder)
  sortOrder?: SupportTicketSortOrder = SupportTicketSortOrder.DESC;
}

