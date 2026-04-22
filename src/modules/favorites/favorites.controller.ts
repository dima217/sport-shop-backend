import { Controller, Get, Post, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from 'src/types/express';

@ApiTags('Favorites')
@Controller('favorites')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Get user favorites' })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'BCP-47 language code to translate product name and description (e.g. "en", "de")',
    example: 'en',
  })
  @ApiResponse({
    status: 200,
    description: 'List of favorite products',
    schema: {
      type: 'object',
      properties: {
        products: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
        total: { type: 'number' },
      },
    },
  })
  async findAll(
    @Req() req: RequestWithUser,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('lang') lang?: string,
  ) {
    return this.favoritesService.findAll(
      req.user.id,
      limit ? Number(limit) : undefined,
      offset ? Number(offset) : undefined,
      lang,
    );
  }

  @Post(':productId')
  @ApiOperation({ summary: 'Add product to favorites' })
  @ApiResponse({
    status: 200,
    description: 'Product added to favorites',
    schema: { type: 'object', properties: { success: { type: 'boolean' } } },
  })
  @ApiResponse({ status: 400, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Product already in favorites' })
  async addToFavorites(@Req() req: RequestWithUser, @Param('productId') productId: string) {
    return this.favoritesService.addToFavorites(req.user.id, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from favorites' })
  @ApiResponse({
    status: 200,
    description: 'Product removed from favorites',
    schema: { type: 'object', properties: { success: { type: 'boolean' } } },
  })
  @ApiResponse({ status: 404, description: 'Product not in favorites' })
  async removeFromFavorites(@Req() req: RequestWithUser, @Param('productId') productId: string) {
    return this.favoritesService.removeFromFavorites(req.user.id, productId);
  }
}
