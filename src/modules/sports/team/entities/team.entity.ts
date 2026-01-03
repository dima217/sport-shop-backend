import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Match } from '../../match/entities/match.entity';

@Entity('team')
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true, type: 'text' })
  logoUrl: string | null;

  @OneToMany(() => Match, (match) => match.teamHome)
  homeMatches: Match[];

  @OneToMany(() => Match, (match) => match.teamAway)
  awayMatches: Match[];
}
