import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsQueryDto } from './dto/products-query.dto';

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
      search,
      minPrice,
      maxPrice,
      inStock,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 20,
      offset = 0,
    } = query;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (search) {
      queryBuilder.andWhere('(product.name ILIKE :search OR product.description ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (inStock !== undefined) {
      queryBuilder.andWhere('product.inStock = :inStock', { inStock });
    }

    // Sorting
    const sortField = sortBy === 'createdAt' ? 'product.createdAt' : `product.${sortBy}`;
    queryBuilder.orderBy(sortField, sortOrder.toUpperCase() as 'ASC' | 'DESC');

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
}
