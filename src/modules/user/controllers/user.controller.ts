import { Controller, Get, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/user.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
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
