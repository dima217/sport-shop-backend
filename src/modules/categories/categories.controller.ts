import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Category } from './entities/category.entity';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'List of categories', type: [Category] })
  async findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<Category[]> {
    return this.categoriesService.findAll(
      limit ? Number(limit) : undefined,
      offset ? Number(offset) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category details', type: Category })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category (Admin only)' })
  @ApiResponse({ status: 201, description: 'Category created', type: Category })
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category (Admin only)' })
  @ApiResponse({ status: 200, description: 'Category updated', type: Category })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete category (Admin only)' })
  @ApiResponse({ status: 200, description: 'Category deleted' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
