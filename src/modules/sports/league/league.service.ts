import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { League } from './entities/league.entity';

@Injectable()
export class LeaguesService {
  constructor(
    @InjectRepository(League)
    private repo: Repository<League>,
  ) {}

  async findOrCreate(name: string): Promise<League> {
    let league = await this.repo.findOne({ where: { name } });

    if (!league) {
      league = this.repo.create({
        name,
        externalId: name.toLowerCase().replace(/\s+/g, '-'),
      });

      await this.repo.save(league);
    }

    return league;
  }
}
