import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from 'src/types/express';
import { Order, OrderStatus } from './entities/order.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles-guard';
import { Roles } from 'src/auth/common/decorators/role.decorator';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create order from cart',
    description: `
      Creates a new order from the current user's cart items.
      
      **Important:**
      - Order is created from all items in the user's cart
      - Cart is automatically cleared after order creation
      - Order status is set to "pending" by default
      - If cart is empty, returns 400 Bad Request
      
      **Request validation:**
      - All delivery address fields are required
      - Payment method must be either "card" or "cash"
      - Comment is optional
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully (HTTP 201 Created)',
    type: Order,
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        userId: 1,
        status: 'pending',
        deliveryStreet: 'ул. Ленина, д. 10, кв. 25',
        deliveryCity: 'Москва',
        deliveryPostalCode: '123456',
        deliveryCountry: 'Россия',
        paymentMethod: 'card',
        comment: 'Позвоните за час до доставки',
        total: 12980,
        createdAt: '2024-01-15T10:30:00.000Z',
        items: [
          {
            id: 'item-uuid-1',
            productId: 'product-uuid-1',
            quantity: 2,
            size: 'M',
            color: 'Черный',
            price: 2990,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - cart is empty or validation error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          oneOf: [
            { type: 'string', example: 'Cart is empty' },
            {
              type: 'array',
              items: { type: 'string' },
              example: [
                'deliveryAddress.street should not be empty',
                'paymentMethod must be one of the following values: card, cash',
              ],
            },
          ],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token is missing or invalid',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async create(@Req() req: RequestWithUser, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get user orders',
    description:
      'Returns a list of all orders for the authenticated user, ordered by creation date (newest first)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user orders',
    type: [Order],
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          userId: 1,
          status: 'pending',
          deliveryStreet: 'ул. Ленина, д. 10, кв. 25',
          deliveryCity: 'Москва',
          deliveryPostalCode: '123456',
          deliveryCountry: 'Россия',
          paymentMethod: 'card',
          comment: null,
          total: 12980,
          createdAt: '2024-01-15T10:30:00.000Z',
          items: [],
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findAll(@Req() req: RequestWithUser) {
    return this.ordersService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get order by ID',
    description:
      'Returns detailed information about a specific order, including all order items with product details',
  })
  @ApiResponse({
    status: 200,
    description: 'Order details with items',
    type: Order,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: {
          type: 'string',
          example: 'Order with ID 550e8400-e29b-41d4-a716-446655440000 not found',
        },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Get all orders (Admin only)',
    description:
      'Returns a paginated list of all orders in the system. Only accessible by administrators.',
  })
  @ApiQuery({
    name: 'status',
    enum: OrderStatus,
    required: false,
    description: 'Filter orders by status',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of items per page (default: 20)',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    type: Number,
    required: false,
    description: 'Number of items to skip (default: 0)',
    example: 0,
  })
  @ApiQuery({
    name: 'sortBy',
    enum: ['createdAt', 'total'],
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
    description: 'List of orders with pagination info',
    schema: {
      type: 'object',
      properties: {
        orders: {
          type: 'array',
          items: { $ref: '#/components/schemas/Order' },
        },
        total: { type: 'number', example: 150 },
        limit: { type: 'number', example: 20 },
        offset: { type: 'number', example: 0 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async findAllAdmin(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ): Promise<{ orders: Order[]; total: number; limit: number; offset: number }> {
    const parsedStatus =
      status && Object.values(OrderStatus).includes(status as OrderStatus)
        ? (status as OrderStatus)
        : undefined;

    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;
    const parsedSortBy: 'createdAt' | 'total' = sortBy === 'total' ? 'total' : 'createdAt';
    const parsedSortOrder: 'asc' | 'desc' = sortOrder === 'asc' ? 'asc' : 'desc';

    return await this.ordersService.findAllAdmin(
      parsedStatus,
      parsedLimit,
      parsedOffset,
      parsedSortBy,
      parsedSortOrder,
    );
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Update order status (Admin only)',
    description: 'Updates the status of an order. Only accessible by administrators.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Order ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
    type: Order,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid status',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return await this.ordersService.updateStatus(id, updateStatusDto);
  }
}
