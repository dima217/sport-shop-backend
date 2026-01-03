import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { MatchesService } from './match.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.matchesService.findAll();
  }
}
