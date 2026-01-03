import { Module } from '@nestjs/common';
import { UsersService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Profile } from './entities/profile.entity';
import { ProfileService } from './services/profile.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '30d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [UsersService, ProfileService],
  exports: [UsersService, ProfileService],
})
export class UserModule {}
