import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsQueryDto } from './dto/reviews-query.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from 'src/types/express';
import { Review } from './entities/review.entity';

@ApiTags('Reviews')
@Controller('products/:productId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get reviews for a product',
    description: `
      Returns a paginated list of reviews for a specific product.
      
      **Features:**
      - Public access (no authentication required)
      - Pagination with limit and offset
      - Sorting by createdAt or rating
      - Filtering by rating (1-5)
      - Includes average rating and rating distribution
    `,
  })
  @ApiParam({
    name: 'productId',
    description: 'Product ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'List of reviews with pagination and statistics',
    schema: {
      type: 'object',
      properties: {
        reviews: {
          type: 'array',
          items: { $ref: '#/components/schemas/Review' },
        },
        total: { type: 'number', example: 42 },
        limit: { type: 'number', example: 20 },
        offset: { type: 'number', example: 0 },
        averageRating: { type: 'number', example: 4.5 },
        ratingDistribution: {
          type: 'object',
          properties: {
            '5': { type: 'number', example: 20 },
            '4': { type: 'number', example: 15 },
            '3': { type: 'number', example: 5 },
            '2': { type: 'number', example: 1 },
            '1': { type: 'number', example: 1 },
          },
        },
      },
      example: {
        reviews: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            productId: 'product-uuid',
            userId: 1,
            user: {
              id: 1,
              firstName: 'Иван',
              lastName: 'Иванов',
            },
            rating: 5,
            comment: 'Отличный товар! Очень доволен покупкой.',
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
          },
        ],
        total: 42,
        limit: 20,
        offset: 0,
        averageRating: 4.5,
        ratingDistribution: {
          '5': 20,
          '4': 15,
          '3': 5,
          '2': 1,
          '1': 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findAll(@Param('productId') productId: string, @Query() query: ReviewsQueryDto) {
    return this.reviewsService.findAll(productId, query);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user review for a product',
    description:
      'Returns the review of the authenticated user for a specific product, or null if not found',
  })
  @ApiParam({
    name: 'productId',
    description: 'Product ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'User review or null if not found',
    type: Review,
    schema: {
      nullable: true,
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        productId: 'product-uuid',
        userId: 1,
        user: {
          id: 1,
          firstName: 'Иван',
          lastName: 'Иванов',
        },
        rating: 5,
        comment: 'Отличный товар!',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findUserReview(@Param('productId') productId: string, @Req() req: RequestWithUser) {
    const review = await this.reviewsService.findUserReview(productId, req.user.id);
    if (!review) {
      return null;
    }
    return review;
  }

  @Get(':reviewId')
  @ApiOperation({
    summary: 'Get a specific review',
    description: 'Returns detailed information about a specific review',
  })
  @ApiParam({
    name: 'productId',
    description: 'Product ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'reviewId',
    description: 'Review ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Review details',
    type: Review,
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  async findOne(@Param('productId') productId: string, @Param('reviewId') reviewId: string) {
    return this.reviewsService.findOne(productId, reviewId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new review',
    description: `
      Creates a new review for a product.
      
      **Important:**
      - User can only create one review per product
      - Rating must be between 1 and 5
      - Comment must be between 10 and 2000 characters
      - Product rating and review count are automatically recalculated
    `,
  })
  @ApiParam({
    name: 'productId',
    description: 'Product ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Review created successfully',
    type: Review,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - user has already reviewed this product',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'User has already reviewed this product' },
        error: { type: 'string', example: 'Conflict' },
      },
    },
  })
  async create(
    @Param('productId') productId: string,
    @Req() req: RequestWithUser,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(productId, req.user.id, createReviewDto);
  }

  @Patch(':reviewId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a review',
    description: `
      Updates an existing review. Only the author can update their review.
      
      **Important:**
      - At least one field (rating or comment) must be provided
      - Rating must be between 1 and 5 (if provided)
      - Comment must be between 10 and 2000 characters (if provided)
      - Product rating is automatically recalculated
    `,
  })
  @ApiParam({
    name: 'productId',
    description: 'Product ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'reviewId',
    description: 'Review ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Review updated successfully',
    type: Review,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not the author of the review',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'You can only edit your own reviews' },
        error: { type: 'string', example: 'Forbidden' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  async update(
    @Param('productId') productId: string,
    @Param('reviewId') reviewId: string,
    @Req() req: RequestWithUser,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(productId, reviewId, req.user.id, updateReviewDto);
  }

  @Delete(':reviewId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a review',
    description: `
      Deletes a review. Only the author can delete their review.
      
      **Important:**
      - Product rating and review count are automatically recalculated
    `,
  })
  @ApiParam({
    name: 'productId',
    description: 'Product ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'reviewId',
    description: 'Review ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Review deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Review deleted successfully' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not the author of the review',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  async remove(
    @Param('productId') productId: string,
    @Param('reviewId') reviewId: string,
    @Req() req: RequestWithUser,
  ) {
    await this.reviewsService.remove(productId, reviewId, req.user.id);
    return { message: 'Review deleted successfully' };
  }
}
