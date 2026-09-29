import { randomUUID } from 'node:crypto';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../redis/redis.service.js';
import type { User } from '../users/entities/user.entity.js';
import { toUserResponse, type UserResponse } from '../users/mappers/user-response.mapper.js';
import { UsersService } from '../users/users.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { JwtPayload } from './interfaces/jwt-payload.interface.js';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async register(dto: RegisterDto): Promise<UserResponse> {
    const { email, username, password } = dto.user;

    if (await this.usersService.findByEmail(email)) {
      throw new UnprocessableEntityException({ email: ['has already been taken'] });
    }
    if (await this.usersService.findByUsername(username)) {
      throw new UnprocessableEntityException({ username: ['has already been taken'] });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await this.usersService.create({
      email,
      username,
      password: hashedPassword,
    });

    return toUserResponse(user, this.issueToken(user));
  }

  async login(dto: LoginDto): Promise<UserResponse> {
    const { email, password } = dto.user;
    const user = await this.usersService.findByEmail(email);
    const passwordMatches = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !passwordMatches) {
      throw new UnprocessableEntityException({ 'email or password': ['is invalid'] });
    }

    return toUserResponse(user, this.issueToken(user));
  }

  async logout(jti: string, exp: number): Promise<void> {
    const ttlSeconds = exp - Math.floor(Date.now() / 1000);
    await this.redisService.setWithTtl(`blacklist:${jti}`, '1', ttlSeconds);
  }

  private issueToken(user: User): string {
    const payload: Pick<JwtPayload, 'sub' | 'jti'> = {
      sub: user.id,
      jti: randomUUID(),
    };
    return this.jwtService.sign(payload);
  }
}
