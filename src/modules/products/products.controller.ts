import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsQueryDto } from './dto/products-query.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Product } from './entities/product.entity';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get products with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of products with pagination info',
    schema: {
      type: 'object',
      properties: {
        products: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
        total: { type: 'number' },
        limit: { type: 'number' },
        offset: { type: 'number' },
      },
    },
  })
  async findAll(@Query() query: ProductsQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product details', type: Product })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  @ApiResponse({ status: 201, description: 'Product created', type: Product })
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product updated', type: Product })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}
