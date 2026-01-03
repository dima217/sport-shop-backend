// src/modules/leagues/leagues.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaguesService } from './league.service';
import { League } from './entities/league.entity';

@Module({
  imports: [TypeOrmModule.forFeature([League])],
  providers: [LeaguesService],
  exports: [LeaguesService],
})
export class LeaguesModule {}
