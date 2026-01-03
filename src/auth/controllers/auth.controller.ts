import { Body, Controller, Get, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LocalGuard } from '../guards/local-guard';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { RequestEmailCodeDto } from '../dto/request-email-code.dto';
import { VerifyEmailCodeDto } from '../dto/verify-email-code.dto';
import { VerificationService } from '../services/verification.service';
import type { LoginRequestUser } from 'src/types/express';
import type { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RegisterUserDto } from '../dto/register.dto';
import { AuthPayloadDto } from '../dto/auth.dto';
import { PasswordService } from '../services/password.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly passwordService: PasswordService,
    private readonly verificationService: VerificationService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            profile: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                avatarUrl: { type: 'string', nullable: true },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @UseGuards(LocalGuard)
  login(@Req() request: LoginRequestUser, @Body() body: AuthPayloadDto, @Res() response: Response) {
    const { id, profile } = request.user;
    if (!profile) {
      throw new Error('Profile not found');
    }
    const payload = this.authService.login(id);
    return this.authService.sendAuthResponse(request, response, {
      ...payload,
      user: {
        profile: {
          id: String(profile.id),
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatarUrl: profile.avatarUrl,
        },
      },
    });
  }

  @Post('sign-up')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({
    status: 200,
    description: 'Registration successful',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'User already exists' })
  async register(
    @Body() registerDto: RegisterUserDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const user = await this.authService.registerUser(registerDto);
    return this.authService.sendAuthResponse(request, response, user);
  }

  @Post('sign-out')
  @ApiOperation({ summary: 'User sign out' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Sign out successful', schema: { type: 'object' } })
  @UseGuards(AuthGuard('jwt'))
  signOut() {
    // В будущем здесь можно добавить инвалидацию токена через blacklist
    return {};
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const { accessToken } = await this.authService.findOrCreateUser(req.user);

    res.redirect(`http://localhost:3000/auth/callback?token=${accessToken}`);
  }

  @Post('check-email')
  async checkEmail(@Body() body: { email: string }) {
    const user = await this.authService.checkEmail(body.email);
    return { exists: !!user };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.passwordService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('email/send-code')
  async sendEmailCode(@Body() dto: RequestEmailCodeDto) {
    return this.verificationService.sendEmailCode(dto.email);
  }

  @Post('email/verify-code')
  verifyCode(@Body() dto: VerifyEmailCodeDto) {
    return this.verificationService.verifyEmailCode(dto.email, dto.code);
  }
}
