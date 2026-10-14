import type { Profile } from '../../profiles/mappers/profile-response.mapper.js';

export interface CommentData {
  id: number;
  createdAt: string;
  updatedAt: string;
  body: string;
  author: Profile;
}

export interface CommentResponse {
  comment: CommentData;
}

export interface CommentsListResponse {
  comments: CommentData[];
}
