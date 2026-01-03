import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private repo: Repository<Team>,
  ) {}

  async findOrCreate(name: string, logoUrl?: string): Promise<Team> {
    let team = await this.repo.findOne({ where: { name } });

    if (!team) {
      team = this.repo.create({ name, logoUrl });
      return await this.repo.save(team);
    }

    if (logoUrl && team.logoUrl !== logoUrl) {
      team.logoUrl = logoUrl;
      await this.repo.save(team);
    }

    return team;
  }

  async findManyOrCreate(teams: { name: string; logoUrl?: string }[]): Promise<Team[]> {
    const result: Team[] = [];

    for (const t of teams) {
      const team = await this.findOrCreate(t.name, t.logoUrl);
      result.push(team);
    }

    return result;
  }
}
