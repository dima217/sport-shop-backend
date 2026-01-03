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
  @ApiOperation({
    summary: 'Get products with advanced filtering, search, and pagination',
    description: `
      Get a paginated list of products with support for:
      
      **Search:**
      - Search by name, description, brand, or SKU (case-insensitive)
      
      **Filters:**
      - Category: by ID (UUID) or slug
      - Price range: minPrice and maxPrice
      - Brands: array of brand names
      - Sizes: array of sizes (finds products that have any of the specified sizes)
      - Colors: array of colors (finds products that have any of the specified colors)
      - Rating: minimum rating (0-5)
      - Stock: only in-stock products
      
      **Sorting:**
      - Sort by: price, rating, name, reviewCount, createdAt
      - Sort order: asc (ascending) or desc (descending)
      
      **Pagination:**
      - limit: number of items per page (1-100, default: 20)
      - offset: number of items to skip (default: 0)
      
      **Examples:**
      - Get all Nike products: ?brands[]=Nike
      - Search for sneakers: ?search=кроссовки
      - Filter by category: ?categorySlug=obuv
      - Price range: ?minPrice=1000&maxPrice=5000
      - Sort by price ascending: ?sortBy=price&sortOrder=asc
      - Combine filters: ?categorySlug=odezhda&brands[]=Nike&sizes[]=M&sizes[]=L&minPrice=2000&maxPrice=5000&sortBy=price&sortOrder=asc
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'List of products with pagination info',
    schema: {
      type: 'object',
      properties: {
        products: {
          type: 'array',
          items: { $ref: '#/components/schemas/Product' },
          description: 'Array of products matching the filters',
        },
        total: {
          type: 'number',
          description: 'Total number of products matching the filters (before pagination)',
          example: 150,
        },
        limit: {
          type: 'number',
          description: 'Number of items per page',
          example: 20,
        },
        offset: {
          type: 'number',
          description: 'Number of items skipped',
          example: 0,
        },
      },
      example: {
        products: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Футболка спортивная Nike Dri-FIT',
            description: 'Дышащая футболка с технологией Dri-FIT',
            price: 2990,
            oldPrice: 3990,
            images: ['https://example.com/image.jpg'],
            inStock: true,
            stockQuantity: 50,
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Черный', 'Белый'],
            brand: 'Nike',
            sku: 'NKE-TSH-001',
            rating: 4.5,
            reviewCount: 23,
          },
        ],
        total: 150,
        limit: 20,
        offset: 0,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['minPrice must be a positive number', 'limit must be at least 1'],
        },
        error: { type: 'string', example: 'Bad Request' },
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
