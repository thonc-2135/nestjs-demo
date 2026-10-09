import type { User } from '../../users/entities/user.entity.js';

export interface ProfileResponse {
  profile: {
    username: string;
    bio: string;
    image: string | null;
    following: boolean;
  };
}

export function toProfileResponse(user: User, following: boolean): ProfileResponse {
  return {
    profile: {
      username: user.username,
      bio: user.bio,
      image: user.image,
      following,
    },
  };
}
