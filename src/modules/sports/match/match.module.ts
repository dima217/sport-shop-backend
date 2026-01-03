import { Match } from '@application/sports/match/entities/match.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesService } from './match.service';
import { MatchesController } from './matches.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MatchesGateway } from './matches.gateway';
import { UserModule } from '@application/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Match]), AuthModule, UserModule],
  providers: [MatchesService, MatchesGateway],
  exports: [MatchesService],
  controllers: [MatchesController],
})
export class MatchesModule {}
