import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateUserResetDto } from '../dto/update-user-reset.dto';

const USER_SELECT_FIELDS = [
  'id',
  'uuid',
  'email',
  'role',
  'isBanned',
  'isOAuthUser',
  'refreshToken',
] as const;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(
    limit = 20,
    offset = 0,
    sortBy: 'id' | 'email' = 'id',
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ users: User[]; total: number; limit: number; offset: number }> {
    // Build query with relations
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile');

    // Get total count before pagination (without relations for performance)
    const total = await this.userRepository.count();

    // Apply sorting
    const orderDirection = sortOrder.toUpperCase() as 'ASC' | 'DESC';
    if (sortBy === 'email') {
      queryBuilder.orderBy('user.email', orderDirection);
    } else {
      queryBuilder.orderBy('user.id', orderDirection);
    }

    // Apply pagination
    queryBuilder.skip(offset).take(limit);

    const users = await queryBuilder.getMany();

    return {
      users,
      total,
      limit,
      offset,
    };
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      select: [...USER_SELECT_FIELDS],
      relations: ['profile'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['profile'],
    });
    return user;
  }

  async findUserForContact(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email'],
    });
  }

  async findByUuid(uuid: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { uuid },
      select: [...USER_SELECT_FIELDS],
    });
  }

  async createUserTransactional(data: Partial<User>, manager: EntityManager): Promise<User> {
    const user = manager.create(User, data);
    return manager.save(user);
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.userRepository.save({ ...user, ...dto });
  }

  async updatePassword(id: number, newPassword: string): Promise<void> {
    await this.userRepository.update(id, {
      password: await argon2.hash(newPassword),
    });
  }

  async updateUserToken(id: number, dto: UpdateUserResetDto): Promise<void> {
    await this.userRepository.update(id, {
      resetPasswordToken: dto.resetPasswordToken,
      tokenExpiredDate: dto.tokenExpiredDate,
    });
  }

  async updateRefreshToken(userId: number, refreshToken: string | null): Promise<void> {
    await this.userRepository.update(userId, {
      refreshToken: refreshToken ? await argon2.hash(refreshToken) : null,
    });
  }

  async incrementTokenVersion(userId: number): Promise<void> {
    const user = await this.getUserById(userId);
    if (user) {
      user.tokenVersion++;
      await this.userRepository.save(user);
    }
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
