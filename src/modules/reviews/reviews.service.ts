import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsQueryDto, ReviewSortBy, ReviewSortOrder } from './dto/reviews-query.dto';
import { ProductsService } from '../products/products.service';
import { Product } from '../products/entities/product.entity';
import { ReviewResponseDto } from './dto/review-response.dto';

export interface ReviewsResponse {
  reviews: ReviewResponseDto[];
  total: number;
  limit: number;
  offset: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private productsService: ProductsService,
    private dataSource: DataSource,
  ) {}

  async findAll(productId: string, query: ReviewsQueryDto): Promise<ReviewsResponse> {
    const {
      limit = 20,
      offset = 0,
      sortBy = ReviewSortBy.CREATED_AT,
      sortOrder = ReviewSortOrder.DESC,
      rating,
    } = query;

    // Verify product exists
    await this.productsService.findOne(productId);

    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('review.productId = :productId', { productId });

    // Filter by rating
    if (rating !== undefined) {
      queryBuilder.andWhere('review.rating = :rating', { rating });
    }

    // Sorting
    let sortField: string;
    switch (sortBy) {
      case ReviewSortBy.RATING:
        sortField = 'review.rating';
        break;
      case ReviewSortBy.CREATED_AT:
      default:
        sortField = 'review.createdAt';
        break;
    }
    queryBuilder.orderBy(sortField, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Secondary sort by ID for consistent pagination
    if (sortBy !== ReviewSortBy.CREATED_AT) {
      queryBuilder.addOrderBy('review.id', 'ASC');
    }

    // Pagination
    queryBuilder.take(limit);
    queryBuilder.skip(offset);

    const [reviews, total] = await queryBuilder.getManyAndCount();

    // Calculate average rating and distribution
    const allReviews = await this.reviewRepository.find({
      where: { productId },
      select: ['rating'],
    });

    const averageRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0;

    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    allReviews.forEach((review) => {
      const ratingKey = review.rating as keyof typeof ratingDistribution;
      if (ratingKey >= 1 && ratingKey <= 5) {
        ratingDistribution[ratingKey]++;
      }
    });

    // Transform reviews to include user profile data in the correct format
    const transformedReviews = reviews.map((review) => this.transformReview(review));

    return {
      reviews: transformedReviews,
      total,
      limit,
      offset,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      ratingDistribution,
    };
  }

  /**
   * Transforms Review entity to ReviewResponseDto format
   */
  private transformReview(review: Review): ReviewResponseDto {
    return {
      id: review.id,
      productId: review.productId,
      userId: review.userId,
      user: {
        id: review.user.id,
        firstName: review.user.profile?.firstName || '',
        lastName: review.user.profile?.lastName || '',
      },
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    };
  }

  async findOne(productId: string, reviewId: string): Promise<ReviewResponseDto> {
    // Verify product exists
    await this.productsService.findOne(productId);

    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, productId },
      relations: ['user', 'user.profile'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.transformReview(review);
  }

  private async findOneEntity(productId: string, reviewId: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, productId },
      relations: ['user', 'user.profile'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async findUserReview(productId: string, userId: number): Promise<ReviewResponseDto | null> {
    // Verify product exists
    await this.productsService.findOne(productId);

    const review = await this.reviewRepository.findOne({
      where: { productId, userId },
      relations: ['user', 'user.profile'],
    });

    return review ? this.transformReview(review) : null;
  }

  async create(
    productId: string,
    userId: number,
    createReviewDto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    // Verify product exists
    await this.productsService.findOne(productId);

    // Check if user already reviewed this product
    const existingReview = await this.reviewRepository.findOne({
      where: { productId, userId },
    });

    if (existingReview) {
      throw new ConflictException('User has already reviewed this product');
    }

    // Create review in transaction
    return this.dataSource.transaction(async (manager) => {
      const review = manager.create(Review, {
        productId,
        userId,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment.trim(),
      });

      const savedReview = await manager.save(review);

      // Recalculate product rating
      await this.recalculateProductRating(manager, productId);

      // Load review with user and profile relations
      const loadedReview = await manager.findOne(Review, {
        where: { id: savedReview.id },
        relations: ['user', 'user.profile'],
      });
      if (!loadedReview) {
        throw new NotFoundException('Review not found after creation');
      }
      return this.transformReview(loadedReview);
    });
  }

  async update(
    productId: string,
    reviewId: string,
    userId: number,
    updateReviewDto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.findOneEntity(productId, reviewId);

    // Check if user is the author
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only edit your own reviews');
    }

    // Validate that at least one field is provided
    if (!updateReviewDto.rating && !updateReviewDto.comment) {
      throw new BadRequestException('At least one field (rating or comment) must be provided');
    }

    // Update review in transaction
    return this.dataSource.transaction(async (manager) => {
      if (updateReviewDto.rating !== undefined) {
        review.rating = updateReviewDto.rating;
      }
      if (updateReviewDto.comment !== undefined) {
        review.comment = updateReviewDto.comment.trim();
      }

      const savedReview = await manager.save(review);

      // Recalculate product rating
      await this.recalculateProductRating(manager, productId);

      // Load review with user and profile relations
      const loadedReview = await manager.findOne(Review, {
        where: { id: savedReview.id },
        relations: ['user', 'user.profile'],
      });
      if (!loadedReview) {
        throw new NotFoundException('Review not found after update');
      }
      return this.transformReview(loadedReview);
    });
  }

  async remove(productId: string, reviewId: string, userId: number): Promise<void> {
    const review = await this.findOneEntity(productId, reviewId);

    // Check if user is the author
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    // Delete review in transaction
    await this.dataSource.transaction(async (manager) => {
      await manager.remove(review);

      // Recalculate product rating
      await this.recalculateProductRating(manager, productId);
    });
  }

  /**
   * Recalculates product rating and review count
   * @param manager - EntityManager from transaction
   * @param productId - Product ID to recalculate rating for
   */
  private async recalculateProductRating(manager: EntityManager, productId: string): Promise<void> {
    const reviews = await manager.find(Review, {
      where: { productId },
      select: ['rating'],
    });

    const reviewCount = reviews.length;
    const averageRating =
      reviewCount > 0
        ? (reviews as { rating: number }[]).reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : null;

    await manager.update(Product, productId, {
      reviewCount,
      rating: averageRating ? Math.round(averageRating * 100) / 100 : null, // Round to 2 decimal places
    });
  }
}
