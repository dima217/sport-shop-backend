import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    private productsService: ProductsService,
  ) {}

  async getCart(userId: number): Promise<{ items: CartItem[]; total: number }> {
    const items = await this.cartItemRepository.find({
      where: { userId },
      relations: ['product', 'product.category'],
    });

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return { items, total };
  }

  async addToCart(userId: number, addToCartDto: AddToCartDto): Promise<CartItem> {
    const { productId, quantity, size, color } = addToCartDto;

    // Check if product exists and is in stock
    const product = await this.productsService.findOne(productId);

    if (!product.inStock) {
      throw new BadRequestException('Product is not in stock');
    }

    // Validate size if product has sizes
    if (product.sizes && product.sizes.length > 0) {
      if (!size || !product.sizes.includes(size)) {
        throw new BadRequestException(`Invalid size. Available sizes: ${product.sizes.join(', ')}`);
      }
    }

    // Validate color if product has colors
    if (product.colors && product.colors.length > 0) {
      if (!color || !product.colors.includes(color)) {
        throw new BadRequestException(
          `Invalid color. Available colors: ${product.colors.join(', ')}`,
        );
      }
    }

    // Check if item already exists in cart with same size/color
    const existingItem = await this.cartItemRepository.findOne({
      where: {
        userId,
        productId,
        size: size ? size : IsNull(),
        color: color ? color : IsNull(),
      },
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      return this.cartItemRepository.save(existingItem);
    }

    // Create new cart item
    const cartItem = this.cartItemRepository.create({
      userId,
      productId,
      quantity,
      size: size || null,
      color: color || null,
      price: product.price,
    });

    return this.cartItemRepository.save(cartItem);
  }

  async updateCartItem(
    userId: number,
    cartItemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItem> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId },
      relations: ['product'],
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
    }

    if (cartItem.userId !== userId) {
      throw new ForbiddenException('You can only update your own cart items');
    }

    cartItem.quantity = updateCartItemDto.quantity;
    return this.cartItemRepository.save(cartItem);
  }

  async removeCartItem(userId: number, cartItemId: string): Promise<void> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
    }

    if (cartItem.userId !== userId) {
      throw new ForbiddenException('You can only delete your own cart items');
    }

    await this.cartItemRepository.remove(cartItem);
  }

  async clearCart(userId: number): Promise<void> {
    await this.cartItemRepository.delete({ userId });
  }
}
