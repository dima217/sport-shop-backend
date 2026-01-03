import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { Team } from '../../team/entities/team.entity';
import { League } from '../../league/entities/league.entity';
import { MatchStatus } from '../types';

@Entity('match')
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  externalId: string;

  @Column()
  title: string;

  @ManyToOne(() => League, { eager: true })
  @JoinColumn({ name: 'leagueId' })
  league: League;

  @RelationId((match: Match) => match.league)
  leagueId: number;

  @ManyToOne(() => Team, { eager: true })
  @JoinColumn({ name: 'teamHomeId' })
  teamHome: Team;

  @RelationId((match: Match) => match.teamHome)
  teamHomeId: number;

  @ManyToOne(() => Team, { eager: true })
  @JoinColumn({ name: 'teamAwayId' })
  teamAway: Team;

  @RelationId((match: Match) => match.teamAway)
  teamAwayId: number;

  @Column({ nullable: true, type: 'text' })
  scoreHome: string;

  @Column({ nullable: true, type: 'text' })
  scoreAway: string;

  @Column({ nullable: true, type: 'int' })
  winnerTeamId: number;

  @Column({ nullable: true, type: 'int' })
  loserTeamId: number;

  @Column({ nullable: true, type: 'text' })
  resultText: string;

  @Column({ nullable: true, type: 'text' })
  info: string;

  @Column({ type: 'enum', enum: MatchStatus, default: MatchStatus.SCHEDULED })
  status: MatchStatus;

  @Column()
  startTime: Date;
}
