import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from 'src/types/express';
import { Order } from './entities/order.entity';

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
}
