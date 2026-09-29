import type { User } from '../entities/user.entity.js';

export interface UserResponse {
  user: {
    email: string;
    token: string;
    username: string;
    bio: string;
    image: string | null;
  };
}

export function toUserResponse(user: User, token: string): UserResponse {
  return {
    user: {
      email: user.email,
      token,
      username: user.username,
      bio: user.bio,
      image: user.image,
    },
  };
}
