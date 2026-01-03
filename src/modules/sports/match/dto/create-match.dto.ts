import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDate, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { MatchStatus } from '../types';

export class CreateMatchDto {
  @IsString()
  @IsNotEmpty()
  externalId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  leagueName: string;

  @IsArray()
  @IsString({ each: true })
  teams: [string, string];

  @IsOptional()
  @IsString()
  scoreHome?: string;

  @IsOptional()
  @IsString()
  scoreAway?: string;

  @IsEnum(MatchStatus)
  status: MatchStatus;

  @IsOptional()
  @IsString()
  info?: string;

  @IsDate()
  @Type(() => Date)
  startTime: Date;
}
