import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AppWebSocketGateway } from '../websocket/websocket.gateway';
import { TranslationService, DEFAULT_CONTENT_LANG } from '../translation/translation.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private webSocketGateway: AppWebSocketGateway,
    private translationService: TranslationService,
  ) {}

  async findAll(limit?: number, offset?: number, lang?: string): Promise<Category[]> {
    const query = this.categoryRepository
      .createQueryBuilder('category')
      .loadRelationCountAndMap('category.productCount', 'category.products');

    if (limit) {
      query.take(limit);
    }
    if (offset) {
      query.skip(offset);
    }

    const categories = await query.getMany();

    return lang ? this.translateCategories(categories, lang) : categories;
  }

  async findOne(id: string, lang?: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return lang ? this.translateCategory(category, lang) : category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create(createCategoryDto);
    const savedCategory = await this.categoryRepository.save(category);
    this.webSocketGateway.emitCategoryCreated(savedCategory);
    return savedCategory;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, updateCategoryDto);
    const savedCategory = await this.categoryRepository.save(category);
    this.webSocketGateway.emitCategoryUpdated(savedCategory);
    return savedCategory;
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
    this.webSocketGateway.emitCategoryDeleted(id);
  }

  // ─── Translation helpers ──────────────────────────────────────────────────

  private async translateCategory(category: Category, lang: string): Promise<Category> {
    const translatedName = await this.translationService.translateText(
      category.name,
      DEFAULT_CONTENT_LANG,
      lang,
    );
    return Object.assign(
      Object.create(Object.getPrototypeOf(category) as object) as Category,
      category,
      { name: translatedName },
    );
  }

  private async translateCategories(categories: Category[], lang: string): Promise<Category[]> {
    return Promise.all(categories.map((c) => this.translateCategory(c, lang)));
  }
}
