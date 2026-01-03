import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from 'src/types/express';
import { CartItem } from './entities/cart-item.entity';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get user cart' })
  @ApiResponse({
    status: 200,
    description: 'Cart with items and total',
    schema: {
      type: 'object',
      properties: {
        items: { type: 'array', items: { $ref: '#/components/schemas/CartItem' } },
        total: { type: 'number' },
      },
    },
  })
  async getCart(@Req() req: RequestWithUser) {
    return this.cartService.getCart(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add product to cart' })
  @ApiResponse({ status: 200, description: 'Item added to cart', type: CartItem })
  @ApiResponse({ status: 400, description: 'Invalid data or product not in stock' })
  async addToCart(@Req() req: RequestWithUser, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, addToCartDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({ status: 200, description: 'Cart item updated', type: CartItem })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async updateCartItem(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(req.user.id, id, updateCartItemDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async removeCartItem(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.cartService.removeCartItem(req.user.id, id);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear entire cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared' })
  async clearCart(@Req() req: RequestWithUser) {
    return this.cartService.clearCart(req.user.id);
  }
}
