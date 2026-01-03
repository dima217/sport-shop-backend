import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  generateAccessToken(userId: number): string {
    return this.jwtService.sign({ id: userId });
  }
}
