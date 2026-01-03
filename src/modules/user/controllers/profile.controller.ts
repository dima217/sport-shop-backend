import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ProfileService } from '../services/profile.service';
import { UserUpdateProfileDTO } from '../dto/update-profile.dto';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from 'src/types/express';
import { UsersService } from '../services/user.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

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
        avatar: { type: 'string', nullable: true },
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
      avatar: user.profile.avatarUrl,
    };
  }

  @Post('/update')
  async updateProfile(@Req() req: RequestWithUser, @Body() body: UserUpdateProfileDTO) {
    return this.profileService.updateProfile(req.user.profileId, body);
  }
}
