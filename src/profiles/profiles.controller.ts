import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';
import type { ProfileResponse } from './mappers/profile-response.mapper.js';
import { ProfilesService } from './profiles.service.js';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':username')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get a profile' })
  getProfile(
    @Param('username') username: string,
    @CurrentUser() currentUser?: User,
  ): Promise<ProfileResponse> {
    return this.profilesService.getProfile(username, currentUser?.id);
  }

  @Post(':username/follow')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Follow a user' })
  follow(
    @Param('username') username: string,
    @CurrentUser() currentUser: User,
  ): Promise<ProfileResponse> {
    return this.profilesService.follow(currentUser, username);
  }

  @Delete(':username/follow')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Unfollow a user' })
  unfollow(
    @Param('username') username: string,
    @CurrentUser() currentUser: User,
  ): Promise<ProfileResponse> {
    return this.profilesService.unfollow(currentUser, username);
  }
}
