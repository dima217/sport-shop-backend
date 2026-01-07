import { Controller, Get, Body, Param, Delete, Put, UseGuards, Query } from '@nestjs/common';
import { UsersService } from '../services/user.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles-guard';
import { Roles } from 'src/auth/common/decorators/role.decorator';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Get all users with pagination (Admin only)',
    description:
      'Retrieves a paginated list of all users in the system. Supports sorting by id or email. Only accessible by administrators.',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of items per page (default: 20, max: 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    type: Number,
    required: false,
    description: 'Number of items to skip (default: 0)',
    example: 0,
  })
  @ApiQuery({
    name: 'sortBy',
    enum: ['id', 'email'],
    required: false,
    description: 'Field to sort by (default: id)',
    example: 'id',
  })
  @ApiQuery({
    name: 'sortOrder',
    enum: ['asc', 'desc'],
    required: false,
    description: 'Sort order (default: asc)',
    example: 'asc',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users with pagination info',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: { $ref: '#/components/schemas/User' },
        },
        total: { type: 'number', example: 150 },
        limit: { type: 'number', example: 20 },
        offset: { type: 'number', example: 0 },
      },
      example: {
        users: [
          {
            id: 1,
            uuid: '123e4567-e89b-12d3-a456-426614174000',
            email: 'user@example.com',
            role: 'user',
            isBanned: false,
            isOAuthUser: false,
            profile: {
              id: 1,
              firstName: 'Иван',
              lastName: 'Иванов',
            },
          },
          {
            id: 2,
            uuid: '223e4567-e89b-12d3-a456-426614174001',
            email: 'admin@example.com',
            role: 'admin',
            isBanned: false,
            isOAuthUser: false,
            profile: {
              id: 2,
              firstName: 'Петр',
              lastName: 'Петров',
            },
          },
          {
            id: 3,
            uuid: '323e4567-e89b-12d3-a456-426614174002',
            email: 'user2@example.com',
            role: 'user',
            isBanned: false,
            isOAuthUser: false,
            profile: null,
          },
        ],
        total: 150,
        limit: 20,
        offset: 0,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ): Promise<{ users: User[]; total: number; limit: number; offset: number }> {
    const parsedLimit = limit ? Math.min(parseInt(limit, 10), 100) : 20;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;
    const parsedSortBy: 'id' | 'email' = sortBy === 'email' ? 'email' : 'id';
    const parsedSortOrder: 'asc' | 'desc' = sortOrder === 'desc' ? 'desc' : 'asc';

    return await this.userService.findAll(parsedLimit, parsedOffset, parsedSortBy, parsedSortOrder);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Get user by ID (Admin only)',
    description:
      'Retrieves detailed information about a specific user. Only accessible by administrators.',
  })
  @ApiParam({
    name: 'id',
    type: 'integer',
    description: 'User ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: User,
    schema: {
      example: {
        id: 1,
        uuid: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        role: 'user',
        isBanned: false,
        isOAuthUser: false,
        profile: {
          id: 1,
          firstName: 'Иван',
          lastName: 'Иванов',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  findOne(@Param('id') id: string) {
    return this.userService.getUserById(+id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Update user (Admin only)',
    description:
      'Updates user information (role and/or ban status). Only accessible by administrators.',
  })
  @ApiParam({
    name: 'id',
    type: 'integer',
    description: 'User ID',
    example: 1,
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User update data',
    examples: {
      updateRole: {
        summary: 'Update user role',
        value: {
          role: 'admin',
        },
      },
      banUser: {
        summary: 'Ban user',
        value: {
          isBanned: true,
        },
      },
      unbanUser: {
        summary: 'Unban user',
        value: {
          isBanned: false,
        },
      },
      updateBoth: {
        summary: 'Update role and ban status',
        value: {
          role: 'user',
          isBanned: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully updated',
    type: User,
    schema: {
      example: {
        id: 1,
        uuid: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        role: 'user',
        isBanned: false,
        isOAuthUser: false,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Delete user (Admin only)',
    description: 'Permanently deletes a user from the system. Only accessible by administrators.',
  })
  @ApiParam({
    name: 'id',
    type: 'integer',
    description: 'User ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully deleted',
    schema: {
      type: 'object',
      example: {
        message: 'User deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
