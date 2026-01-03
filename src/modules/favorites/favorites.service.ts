import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { ProductsService } from '../products/products.service';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    private productsService: ProductsService,
  ) {}

  async findAll(
    userId: number,
    limit?: number,
    offset?: number,
  ): Promise<{ products: Product[]; total: number }> {
    const queryBuilder = this.favoriteRepository
      .createQueryBuilder('favorite')
      .leftJoinAndSelect('favorite.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .where('favorite.userId = :userId', { userId })
      .orderBy('favorite.createdAt', 'DESC');

    if (limit) {
      queryBuilder.take(limit);
    }
    if (offset) {
      queryBuilder.skip(offset);
    }

    const [favorites, total] = await queryBuilder.getManyAndCount();

    return {
      products: favorites.map((favorite) => favorite.product),
      total,
    };
  }

  async addToFavorites(userId: number, productId: string): Promise<{ success: boolean }> {
    // Check if product exists
    await this.productsService.findOne(productId);

    // Check if already in favorites
    const existing = await this.favoriteRepository.findOne({
      where: { userId, productId },
    });

    if (existing) {
      throw new ConflictException('Product is already in favorites');
    }

    const favorite = this.favoriteRepository.create({ userId, productId });
    await this.favoriteRepository.save(favorite);

    return { success: true };
  }

  async removeFromFavorites(userId: number, productId: string): Promise<{ success: boolean }> {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, productId },
    });

    if (!favorite) {
      throw new NotFoundException('Product is not in favorites');
    }

    await this.favoriteRepository.remove(favorite);

    return { success: true };
  }
}
