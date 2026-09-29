import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentToken } from '../auth/decorators/current-token.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { User } from './entities/user.entity.js';
import { toUserResponse, type UserResponse } from './mappers/user-response.mapper.js';

@ApiTags('user')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UsersController {
  @Get()
  @ApiOperation({ summary: 'Get current user' })
  getCurrentUser(
    @CurrentUser() user: User,
    @CurrentToken() token: string,
  ): UserResponse {
    return toUserResponse(user, token);
  }
}
