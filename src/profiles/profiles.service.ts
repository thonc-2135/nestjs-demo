import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { Follow } from './entities/follow.entity.js';
import { toProfileResponse, type ProfileResponse } from './mappers/profile-response.mapper.js';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(Follow)
    private readonly followsRepository: Repository<Follow>,
  ) {}

  async getProfile(username: string, currentUserId?: string): Promise<ProfileResponse> {
    const user = await this.findUserOrFail(username);
    const following = currentUserId ? await this.isFollowing(currentUserId, user.id) : false;
    return toProfileResponse(user, following);
  }

  async follow(currentUser: User, username: string): Promise<ProfileResponse> {
    const target = await this.findUserOrFail(username);
    if (target.id === currentUser.id) {
      throw new UnprocessableEntityException({ username: ["can't follow yourself"] });
    }

    const alreadyFollowing = await this.isFollowing(currentUser.id, target.id);
    if (!alreadyFollowing) {
      await this.followsRepository.insert({
        followerId: currentUser.id,
        followingId: target.id,
      });
    }

    return toProfileResponse(target, true);
  }

  async unfollow(currentUser: User, username: string): Promise<ProfileResponse> {
    const target = await this.findUserOrFail(username);
    await this.followsRepository.delete({
      followerId: currentUser.id,
      followingId: target.id,
    });
    return toProfileResponse(target, false);
  }

  private async findUserOrFail(username: string): Promise<User> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new NotFoundException({ username: ['not found'] });
    }
    return user;
  }

  private async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const count = await this.followsRepository.count({
      where: { followerId, followingId },
    });
    return count > 0;
  }
}
