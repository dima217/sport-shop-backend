import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Create order from cart' })
  @ApiResponse({ status: 200, description: 'Order created', type: Order })
  @ApiResponse({ status: 400, description: 'Cart is empty' })
  async create(@Req() req: RequestWithUser, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user orders' })
  @ApiResponse({ status: 200, description: 'List of user orders', type: [Order] })
  async findAll(@Req() req: RequestWithUser) {
    return this.ordersService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order details', type: Order })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }
}
