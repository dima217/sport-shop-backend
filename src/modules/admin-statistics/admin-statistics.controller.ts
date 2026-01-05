import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminStatisticsService } from './admin-statistics.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles-guard';
import { Roles } from 'src/auth/common/decorators/role.decorator';

@ApiTags('Admin Statistics')
@Controller('admin/statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AdminStatisticsController {
  constructor(private readonly statisticsService: AdminStatisticsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get general statistics (Admin only)',
    description:
      'Returns overall statistics including orders, products, revenue, and categories. Only accessible by administrators.',
  })
  @ApiResponse({
    status: 200,
    description: 'General statistics',
    schema: {
      type: 'object',
      properties: {
        orders: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 1250 },
            pending: { type: 'number', example: 15 },
            processing: { type: 'number', example: 8 },
            shipped: { type: 'number', example: 12 },
            delivered: { type: 'number', example: 1200 },
            cancelled: { type: 'number', example: 15 },
          },
        },
        products: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 450 },
            inStock: { type: 'number', example: 380 },
            outOfStock: { type: 'number', example: 70 },
            lowStock: { type: 'number', example: 25 },
          },
        },
        revenue: {
          type: 'object',
          properties: {
            today: { type: 'number', example: 125000 },
            week: { type: 'number', example: 850000 },
            month: { type: 'number', example: 3500000 },
            total: { type: 'number', example: 12500000 },
          },
        },
        categories: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 7 },
          },
        },
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
  async getGeneralStatistics() {
    return this.statisticsService.getGeneralStatistics();
  }

  @Get('products')
  @ApiOperation({
    summary: 'Get products statistics (Admin only)',
    description:
      'Returns statistics about products including top selling products, low stock items, and out of stock items. Only accessible by administrators.',
  })
  @ApiQuery({
    name: 'period',
    enum: ['day', 'week', 'month', 'year'],
    required: false,
    description: 'Time period for statistics (default: month)',
    example: 'month',
  })
  @ApiResponse({
    status: 200,
    description: 'Products statistics',
    schema: {
      type: 'object',
      properties: {
        topProducts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string', example: 'product-uuid-1' },
              productName: { type: 'string', example: 'Футболка Nike' },
              salesCount: { type: 'number', example: 150 },
              revenue: { type: 'number', example: 448500 },
            },
          },
        },
        lowStock: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string', example: 'product-uuid-2' },
              productName: { type: 'string', example: 'Кроссовки Adidas' },
              stockQuantity: { type: 'number', example: 3 },
              inStock: { type: 'boolean', example: true },
            },
          },
        },
        outOfStock: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string', example: 'product-uuid-3' },
              productName: { type: 'string', example: 'Мяч футбольный' },
              stockQuantity: { type: 'number', example: 0 },
              inStock: { type: 'boolean', example: false },
            },
          },
        },
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
  async getProductsStatistics(@Query('period') period?: 'day' | 'week' | 'month' | 'year') {
    return this.statisticsService.getProductsStatistics(period || 'month');
  }
}

