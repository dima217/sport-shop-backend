import { Match } from '@application/sports/match/entities/match.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('leagues')
export class League {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'external_id', length: 50, unique: true })
  externalId: string;

  @Column({ length: 100 })
  name: string;

  @OneToMany(() => Match, (match) => match.league)
  matches: Match[];
}
