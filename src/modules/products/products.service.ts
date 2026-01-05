import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SetDiscountDto } from './dto/set-discount.dto';
import { ProductsQueryDto, SortBy } from './dto/products-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(
    query: ProductsQueryDto,
  ): Promise<{ products: Product[]; total: number; limit: number; offset: number }> {
    const {
      categoryId,
      categorySlug,
      search,
      minPrice,
      maxPrice,
      brands,
      sizes,
      colors,
      minRating,
      inStock,
      sortBy = SortBy.CREATED_AT,
      sortOrder = 'desc',
      limit = 20,
      offset = 0,
    } = query;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    // Filter by category ID
    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    // Filter by category slug
    if (categorySlug) {
      queryBuilder.andWhere('category.slug = :categorySlug', { categorySlug });
    }

    // Search in name, description, brand, and SKU
    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search OR product.brand ILIKE :search OR product.sku ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    // Price range filter
    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Brand filter
    if (brands && brands.length > 0) {
      queryBuilder.andWhere('product.brand IN (:...brands)', { brands });
    }

    // Size filter (check if array contains any of the specified sizes)
    if (sizes && sizes.length > 0) {
      // Use PostgreSQL array overlap operator (&&) to check if sizes array intersects with filter
      // Also handle null case
      queryBuilder.andWhere('(product.sizes IS NOT NULL AND product.sizes && :sizes::text[])', {
        sizes,
      });
    }

    // Color filter (check if array contains any of the specified colors)
    if (colors && colors.length > 0) {
      // Use PostgreSQL array overlap operator (&&) to check if colors array intersects with filter
      // Also handle null case
      queryBuilder.andWhere('(product.colors IS NOT NULL AND product.colors && :colors::text[])', {
        colors,
      });
    }

    // Rating filter
    if (minRating !== undefined) {
      queryBuilder.andWhere('product.rating >= :minRating', { minRating });
    }

    // Stock filter
    if (inStock !== undefined) {
      queryBuilder.andWhere('product.inStock = :inStock', { inStock });
    }

    // Sorting
    let sortField: string;
    switch (sortBy) {
      case SortBy.PRICE:
        sortField = 'product.price';
        break;
      case SortBy.RATING:
        sortField = 'product.rating';
        break;
      case SortBy.NAME:
        sortField = 'product.name';
        break;
      case SortBy.REVIEW_COUNT:
        sortField = 'product.reviewCount';
        break;
      case SortBy.CREATED_AT:
      default:
        sortField = 'product.createdAt';
        break;
    }
    queryBuilder.orderBy(sortField, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Secondary sort by ID for consistent pagination
    if (sortBy !== SortBy.CREATED_AT) {
      queryBuilder.addOrderBy('product.id', 'ASC');
    }

    // Pagination
    queryBuilder.take(limit);
    queryBuilder.skip(offset);

    const [products, total] = await queryBuilder.getManyAndCount();

    return {
      products,
      total,
      limit,
      offset,
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async setDiscount(id: string, setDiscountDto: SetDiscountDto): Promise<Product> {
    const product = await this.findOne(id);

    if (setDiscountDto.oldPrice) {
      // If oldPrice is provided, use it directly and calculate new discounted price
      product.oldPrice = setDiscountDto.oldPrice;
      const discountMultiplier = 1 - setDiscountDto.discountPercent / 100;
      product.price = Math.round(setDiscountDto.oldPrice * discountMultiplier);
    } else {
      // Current price becomes the old price, calculate new discounted price
      product.oldPrice = product.price;
      const discountMultiplier = 1 - setDiscountDto.discountPercent / 100;
      product.price = Math.round(product.price * discountMultiplier);
    }

    return this.productRepository.save(product);
  }

  async removeDiscount(id: string): Promise<Product> {
    const product = await this.findOne(id);

    // Restore price to oldPrice if it exists, otherwise keep current price
    if (product.oldPrice) {
      product.price = product.oldPrice;
      product.oldPrice = null;
    }

    return this.productRepository.save(product);
  }
}
