import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ProfileService } from '../services/profile.service';
import { UserUpdateProfileDTO } from '../dto/update-profile.dto';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from 'src/types/express';
import { UsersService } from '../services/user.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Profile')
@Controller('profile')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
      },
    },
  })
  async getProfile(@Req() req: RequestWithUser) {
    const user = await this.usersService.getUserById(req.user.id);
    if (!user || !user.profile) {
      throw new Error('User or profile not found');
    }

    return {
      id: user.uuid,
      email: user.email,
      name: `${user.profile.firstName} ${user.profile.lastName}`,
    };
  }

  @Post('/update')
  @ApiOperation({
    summary: 'Update current user profile',
    description:
      'Updates the profile information (first name and/or last name) of the authenticated user',
  })
  @ApiBody({
    type: UserUpdateProfileDTO,
    description: 'Profile update data',
    examples: {
      updateFirstName: {
        summary: 'Update first name only',
        value: {
          firstName: 'Иван',
        },
      },
      updateLastName: {
        summary: 'Update last name only',
        value: {
          lastName: 'Иванов',
        },
      },
      updateBoth: {
        summary: 'Update both names',
        value: {
          firstName: 'Иван',
          lastName: 'Иванов',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'User UUID',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        email: {
          type: 'string',
          description: 'User email',
          example: 'user@example.com',
        },
        name: {
          type: 'string',
          description: 'Full name (firstName + lastName)',
          example: 'Иван Иванов',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  async updateProfile(@Req() req: RequestWithUser, @Body() body: UserUpdateProfileDTO) {
    await this.profileService.updateProfile(req.user.profileId, body);
    const user = await this.usersService.getUserById(req.user.id);
    if (!user || !user.profile) {
      throw new Error('User or profile not found');
    }

    return {
      id: user.uuid,
      email: user.email,
      name: `${user.profile.firstName} ${user.profile.lastName}`,
    };
  }
}
