import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { League } from '../league/entities/league.entity';
import { Team } from '../team/entities/team.entity';
import { MatchStatus } from './types';
import { MatchesGateway } from './matches.gateway';

interface SaveMatchDto {
  externalId: string;
  title: string;
  league: League;
  teamHome: Team;
  teamAway: Team;

  scoreHome?: string;
  scoreAway?: string;

  winnerTeamId?: number;
  loserTeamId?: number;

  resultText?: string;
  info?: string;

  status: MatchStatus;

  startTime: Date;
}

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private repo: Repository<Match>,
    private readonly matchesGateway: MatchesGateway,
  ) {}

  async findByExternalId(id: string): Promise<Match | null> {
    return this.repo.findOneBy({ externalId: id });
  }

  async saveOrUpdate(data: SaveMatchDto): Promise<Match> {
    let match = await this.findByExternalId(data.externalId);

    const updateData: Partial<Match> = {
      title: data.title,
      status: data.status,
      startTime: data.startTime,

      league: data.league,
      teamHome: data.teamHome,
      teamAway: data.teamAway,

      scoreHome: data.scoreHome,
      scoreAway: data.scoreAway,
      winnerTeamId: data.winnerTeamId,
      loserTeamId: data.loserTeamId,
      resultText: data.resultText,
      info: data.info,
    };

    let isNew = false;
    let hasChanges = false;

    if (!match) {
      const createPayload = {
        externalId: data.externalId,
        ...updateData,
      };
      match = this.repo.create(createPayload);
      isNew = true;
    } else {
      hasChanges = this.hasMatchChanged(match, updateData);
      if (hasChanges) {
        Object.assign(match, updateData);
      } else {
        return match;
      }
    }
    const savedMatch = await this.repo.save(match);

    if (isNew || hasChanges) {
      this.matchesGateway.sendMatchUpdate(savedMatch);
    }

    return savedMatch;
  }

  private hasMatchChanged(existingMatch: Match, newData: Partial<Match>): boolean {
    if (
      existingMatch.title !== newData.title ||
      existingMatch.status !== newData.status ||
      existingMatch.scoreHome !== newData.scoreHome ||
      existingMatch.scoreAway !== newData.scoreAway
    ) {
      return true;
    }

    if (existingMatch.league?.id !== newData.league?.id) {
      return true;
    }

    return false;
  }

  async findAll(): Promise<Match[]> {
    return this.repo.find({
      order: { startTime: 'ASC' },
    });
  }
}
