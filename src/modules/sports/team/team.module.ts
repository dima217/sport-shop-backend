import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsService } from './team.service';
import { Team } from './entities/team.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Team])],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
