import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SupportService } from './support.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { ReplyToTicketDto } from './dto/reply-to-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { SupportTicketQueryDto } from './dto/support-ticket-query.dto';
import { SupportTicketResponseDto } from './dto/support-ticket-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles-guard';
import { Roles } from 'src/auth/common/decorators/role.decorator';
import { SupportTicketStatus } from './entities/support-ticket.entity';

@ApiTags('Support')
@Controller('support')
@ApiBearerAuth()
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  // ========== USER ENDPOINTS ==========

  @Post('tickets')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a new support ticket',
    description:
      'Allows authenticated users to create a new support ticket with a subject and message.',
  })
  @ApiBody({
    type: CreateSupportTicketDto,
    examples: {
      example1: {
        summary: 'Order issue',
        value: {
          subject: 'Проблема с заказом #12345',
          message:
            'Мой заказ не был доставлен в указанное время. Пожалуйста, помогите разобраться.',
        },
      },
      example2: {
        summary: 'Product question',
        value: {
          subject: 'Вопрос о товаре',
          message: 'Хочу узнать, когда будет доступен товар в размере XL?',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Ticket created successfully',
    type: SupportTicketResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error',
  })
  async create(
    @Request() req,
    @Body() createDto: CreateSupportTicketDto,
  ): Promise<SupportTicketResponseDto> {
    return await this.supportService.create(req.user.id, createDto);
  }

  @Get('tickets')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all tickets for current user',
    description:
      'Retrieves all support tickets created by the authenticated user. Supports pagination, filtering by status, and sorting.',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of tickets per page (default: 20, max: 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    type: Number,
    required: false,
    description: 'Number of tickets to skip (default: 0)',
    example: 0,
  })
  @ApiQuery({
    name: 'status',
    enum: SupportTicketStatus,
    required: false,
    description: 'Filter by ticket status',
  })
  @ApiQuery({
    name: 'sortBy',
    enum: ['createdAt', 'updatedAt', 'status'],
    required: false,
    description: 'Field to sort by (default: createdAt)',
  })
  @ApiQuery({
    name: 'sortOrder',
    enum: ['asc', 'desc'],
    required: false,
    description: 'Sort order (default: desc)',
  })
  @ApiResponse({
    status: 200,
    description: 'Tickets retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        tickets: {
          type: 'array',
          items: { $ref: '#/components/schemas/SupportTicketResponseDto' },
        },
        total: { type: 'number', example: 10 },
        limit: { type: 'number', example: 20 },
        offset: { type: 'number', example: 0 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async findAllByUser(@Request() req, @Query() query: SupportTicketQueryDto) {
    return await this.supportService.findAllByUser(req.user.id, query);
  }

  @Get('tickets/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get a single ticket by ID',
    description: 'Retrieves a specific support ticket. Users can only access their own tickets.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Ticket ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket retrieved successfully',
    type: SupportTicketResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found',
  })
  async findOneByUser(@Request() req, @Param('id') id: string): Promise<SupportTicketResponseDto> {
    return await this.supportService.findOneByUser(parseInt(id, 10), req.user.id);
  }

  // ========== ADMIN ENDPOINTS ==========

  @Get('admin/tickets')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Get all tickets (Admin only)',
    description:
      'Retrieves all support tickets in the system. Supports pagination, filtering by status, and sorting. Only accessible by administrators.',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of tickets per page (default: 20, max: 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    type: Number,
    required: false,
    description: 'Number of tickets to skip (default: 0)',
    example: 0,
  })
  @ApiQuery({
    name: 'status',
    enum: SupportTicketStatus,
    required: false,
    description: 'Filter by ticket status',
  })
  @ApiQuery({
    name: 'sortBy',
    enum: ['createdAt', 'updatedAt', 'status'],
    required: false,
    description: 'Field to sort by (default: createdAt)',
  })
  @ApiQuery({
    name: 'sortOrder',
    enum: ['asc', 'desc'],
    required: false,
    description: 'Sort order (default: desc)',
  })
  @ApiResponse({
    status: 200,
    description: 'Tickets retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        tickets: {
          type: 'array',
          items: { $ref: '#/components/schemas/SupportTicketResponseDto' },
        },
        total: { type: 'number', example: 50 },
        limit: { type: 'number', example: 20 },
        offset: { type: 'number', example: 0 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async findAllAdmin(@Query() query: SupportTicketQueryDto) {
    return await this.supportService.findAllAdmin(query);
  }

  @Get('admin/tickets/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Get a single ticket by ID (Admin only)',
    description:
      'Retrieves detailed information about a specific support ticket. Only accessible by administrators.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Ticket ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket retrieved successfully',
    type: SupportTicketResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found',
  })
  async findOneAdmin(@Param('id') id: string): Promise<SupportTicketResponseDto> {
    return await this.supportService.findOneAdmin(parseInt(id, 10));
  }

  @Patch('admin/tickets/:id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Reply to a ticket (Admin only)',
    description:
      'Allows administrators to reply to a support ticket. The ticket status will automatically change to "in_progress" if it was "open".',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Ticket ID',
    example: 1,
  })
  @ApiBody({
    type: ReplyToTicketDto,
    examples: {
      example1: {
        summary: 'Standard reply',
        value: {
          response:
            'Спасибо за обращение. Мы проверили ваш заказ и связались с курьером. Заказ будет доставлен сегодня до 18:00.',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Reply sent successfully',
    type: SupportTicketResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Cannot reply to closed ticket or validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found',
  })
  async replyToTicket(
    @Param('id') id: string,
    @Body() replyDto: ReplyToTicketDto,
  ): Promise<SupportTicketResponseDto> {
    return await this.supportService.replyToTicket(parseInt(id, 10), replyDto);
  }

  @Patch('admin/tickets/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Update ticket status (Admin only)',
    description:
      'Allows administrators to change the status of a support ticket (open, in_progress, resolved, closed).',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Ticket ID',
    example: 1,
  })
  @ApiBody({
    type: UpdateTicketStatusDto,
    examples: {
      example1: {
        summary: 'Mark as resolved',
        value: {
          status: 'resolved',
        },
      },
      example2: {
        summary: 'Close ticket',
        value: {
          status: 'closed',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Status updated successfully',
    type: SupportTicketResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateTicketStatusDto,
  ): Promise<SupportTicketResponseDto> {
    return await this.supportService.updateStatus(parseInt(id, 10), updateDto);
  }
}
