import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hashPassword } from '../common/utils/password.util.js';
import { User } from './entities/user.entity.js';

export interface UpdateProfileData {
  email?: string;
  username?: string;
  password?: string;
  bio?: string;
  image?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  findByEmailOrUsername(email: string, username: string): Promise<User[]> {
    return this.usersRepository.find({ where: [{ email }, { username }] });
  }

  create(data: { email: string; username: string; password: string }): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async updateProfile(user: User, data: UpdateProfileData): Promise<User> {
    if (data.email !== undefined && data.email !== user.email) {
      if (await this.findByEmail(data.email)) {
        throw new UnprocessableEntityException({ email: ['has already been taken'] });
      }
      user.email = data.email;
    }

    if (data.username !== undefined && data.username !== user.username) {
      if (await this.findByUsername(data.username)) {
        throw new UnprocessableEntityException({ username: ['has already been taken'] });
      }
      user.username = data.username;
    }

    if (data.password !== undefined) {
      user.password = await hashPassword(data.password);
    }

    if (data.bio !== undefined) {
      user.bio = data.bio;
    }

    if (data.image !== undefined) {
      user.image = data.image;
    }

    return this.usersRepository.save(user);
  }
}
