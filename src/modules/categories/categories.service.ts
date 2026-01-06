import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AppWebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private webSocketGateway: AppWebSocketGateway,
  ) {}

  async findAll(limit?: number, offset?: number): Promise<Category[]> {
    const query = this.categoryRepository
      .createQueryBuilder('category')
      .loadRelationCountAndMap('category.productCount', 'category.products');

    if (limit) {
      query.take(limit);
    }
    if (offset) {
      query.skip(offset);
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
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
}
