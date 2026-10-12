import type { Profile } from '../../profiles/mappers/profile-response.mapper.js';

export interface ArticleData {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: Profile;
}

export interface ArticleResponse {
  article: ArticleData;
}

export interface ArticlesListResponse {
  articles: ArticleData[];
  articlesCount: number;
}
