import type { User } from '../../users/entities/user.entity.js';

export interface Profile {
  username: string;
  bio: string;
  image: string | null;
  following: boolean;
}

export interface ProfileResponse {
  profile: Profile;
}

export function toProfile(user: User, following: boolean): Profile {
  return {
    username: user.username,
    bio: user.bio,
    image: user.image,
    following,
  };
}

export function toProfileResponse(user: User, following: boolean): ProfileResponse {
  return { profile: toProfile(user, following) };
}
