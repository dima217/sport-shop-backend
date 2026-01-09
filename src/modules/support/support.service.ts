import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket, SupportTicketStatus } from './entities/support-ticket.entity';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { ReplyToTicketDto } from './dto/reply-to-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import {
  SupportTicketQueryDto,
  SupportTicketSortBy,
  SupportTicketSortOrder,
} from './dto/support-ticket-query.dto';
import { SupportTicketResponseDto } from './dto/support-ticket-response.dto';
import { AppWebSocketGateway } from '../websocket/websocket.gateway';

export interface SupportTicketsResponse {
  tickets: SupportTicketResponseDto[];
  total: number;
  limit: number;
  offset: number;
}

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportTicket)
    private supportTicketRepository: Repository<SupportTicket>,
    private webSocketGateway: AppWebSocketGateway,
  ) {}

  /**
   * Create a new support ticket (User only)
   */
  async create(
    userId: number,
    createDto: CreateSupportTicketDto,
  ): Promise<SupportTicketResponseDto> {
    const ticket = this.supportTicketRepository.create({
      userId,
      subject: createDto.subject,
      message: createDto.message,
      status: SupportTicketStatus.OPEN,
    });

    const savedTicket = await this.supportTicketRepository.save(ticket);

    // Emit WebSocket event for admins
    this.webSocketGateway.emitSupportTicketCreated({
      ticketId: savedTicket.id,
      userId,
      subject: savedTicket.subject,
      status: savedTicket.status,
      createdAt: savedTicket.createdAt,
    });

    return this.transformTicket(savedTicket);
  }

  /**
   * Get all tickets for a user (User only)
   */
  async findAllByUser(
    userId: number,
    query: SupportTicketQueryDto,
  ): Promise<SupportTicketsResponse> {
    const {
      limit = 20,
      offset = 0,
      status,
      sortBy = SupportTicketSortBy.CREATED_AT,
      sortOrder = SupportTicketSortOrder.DESC,
    } = query;

    const queryBuilder = this.supportTicketRepository
      .createQueryBuilder('ticket')
      .where('ticket.userId = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('ticket.status = :status', { status });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply sorting
    const orderDirection = sortOrder.toUpperCase() as 'ASC' | 'DESC';
    switch (sortBy) {
      case SupportTicketSortBy.UPDATED_AT:
        queryBuilder.orderBy('ticket.updatedAt', orderDirection);
        break;
      case SupportTicketSortBy.STATUS:
        queryBuilder.orderBy('ticket.status', orderDirection);
        break;
      case SupportTicketSortBy.CREATED_AT:
      default:
        queryBuilder.orderBy('ticket.createdAt', orderDirection);
        break;
    }

    // Apply pagination
    queryBuilder.skip(offset).take(limit);

    const tickets = await queryBuilder.getMany();

    return {
      tickets: tickets.map((ticket) => this.transformTicket(ticket)),
      total,
      limit,
      offset,
    };
  }

  /**
   * Get a single ticket by ID (User can only see their own tickets)
   */
  async findOneByUser(ticketId: number, userId: number): Promise<SupportTicketResponseDto> {
    const ticket = await this.supportTicketRepository.findOne({
      where: { id: ticketId, userId },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    return this.transformTicket(ticket);
  }

  /**
   * Get all tickets (Admin only)
   */
  async findAllAdmin(query: SupportTicketQueryDto): Promise<SupportTicketsResponse> {
    const {
      limit = 20,
      offset = 0,
      status,
      sortBy = SupportTicketSortBy.CREATED_AT,
      sortOrder = SupportTicketSortOrder.DESC,
    } = query;

    const queryBuilder = this.supportTicketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile');

    if (status) {
      queryBuilder.andWhere('ticket.status = :status', { status });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply sorting
    const orderDirection = sortOrder.toUpperCase() as 'ASC' | 'DESC';
    switch (sortBy) {
      case SupportTicketSortBy.UPDATED_AT:
        queryBuilder.orderBy('ticket.updatedAt', orderDirection);
        break;
      case SupportTicketSortBy.STATUS:
        queryBuilder.orderBy('ticket.status', orderDirection);
        break;
      case SupportTicketSortBy.CREATED_AT:
      default:
        queryBuilder.orderBy('ticket.createdAt', orderDirection);
        break;
    }

    // Apply pagination
    queryBuilder.skip(offset).take(limit);

    const tickets = await queryBuilder.getMany();

    return {
      tickets: tickets.map((ticket) => this.transformTicket(ticket)),
      total,
      limit,
      offset,
    };
  }

  /**
   * Get a single ticket by ID (Admin only)
   */
  async findOneAdmin(ticketId: number): Promise<SupportTicketResponseDto> {
    const ticket = await this.supportTicketRepository.findOne({
      where: { id: ticketId },
      relations: ['user', 'user.profile'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    return this.transformTicket(ticket);
  }

  /**
   * Reply to a ticket (Admin only)
   */
  async replyToTicket(
    ticketId: number,
    replyDto: ReplyToTicketDto,
  ): Promise<SupportTicketResponseDto> {
    const ticket = await this.supportTicketRepository.findOne({
      where: { id: ticketId },
      relations: ['user'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    if (ticket.status === SupportTicketStatus.CLOSED) {
      throw new BadRequestException('Cannot reply to a closed ticket');
    }

    ticket.adminResponse = replyDto.response;
    if (ticket.status === SupportTicketStatus.OPEN) {
      ticket.status = SupportTicketStatus.IN_PROGRESS;
    }

    const updatedTicket = await this.supportTicketRepository.save(ticket);

    // Emit WebSocket event to notify user
    this.webSocketGateway.emitSupportTicketReplied({
      ticketId: updatedTicket.id,
      userId: updatedTicket.userId,
      response: updatedTicket.adminResponse || '',
      status: updatedTicket.status,
      updatedAt: updatedTicket.updatedAt,
    });

    return this.transformTicket(updatedTicket);
  }

  /**
   * Update ticket status (Admin only)
   */
  async updateStatus(
    ticketId: number,
    updateDto: UpdateTicketStatusDto,
  ): Promise<SupportTicketResponseDto> {
    const ticket = await this.supportTicketRepository.findOne({
      where: { id: ticketId },
      relations: ['user'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    ticket.status = updateDto.status;
    const updatedTicket = await this.supportTicketRepository.save(ticket);

    // Emit WebSocket event to notify user
    this.webSocketGateway.emitSupportTicketStatusUpdated({
      ticketId: updatedTicket.id,
      userId: updatedTicket.userId,
      status: updatedTicket.status,
      updatedAt: updatedTicket.updatedAt,
    });

    return this.transformTicket(updatedTicket);
  }

  /**
   * Transform entity to response DTO
   */
  private transformTicket(ticket: SupportTicket): SupportTicketResponseDto {
    return {
      id: ticket.id,
      userId: ticket.userId,
      subject: ticket.subject,
      message: ticket.message,
      status: ticket.status,
      adminResponse: ticket.adminResponse,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    };
  }
}
