import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticlesService } from '../articles/articles.service.js';
import { toProfile } from '../profiles/mappers/profile-response.mapper.js';
import { ProfilesService } from '../profiles/profiles.service.js';
import type { User } from '../users/entities/user.entity.js';
import type { CreateCommentDto } from './dto/create-comment.dto.js';
import { Comment } from './entities/comment.entity.js';
import type {
  CommentData,
  CommentResponse,
  CommentsListResponse,
} from './mappers/comment-response.mapper.js';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly articlesService: ArticlesService,
    private readonly profilesService: ProfilesService,
  ) {}

  async addComment(
    currentUser: User,
    slug: string,
    dto: CreateCommentDto,
  ): Promise<CommentResponse> {
    const article = await this.articlesService.findBySlugOrFail(slug);

    const comment = this.commentsRepository.create({
      body: dto.comment.body,
      authorId: currentUser.id,
      author: currentUser,
      articleId: article.id,
    });
    const saved = await this.commentsRepository.save(comment);

    const [data] = await this.buildCommentDataList([saved], currentUser.id);
    return { comment: data };
  }

  async listComments(slug: string, currentUserId?: string): Promise<CommentsListResponse> {
    const article = await this.articlesService.findBySlugOrFail(slug);
    const comments = await this.commentsRepository.find({
      where: { articleId: article.id },
      relations: { author: true },
      order: { createdAt: 'ASC' },
    });

    const data = await this.buildCommentDataList(comments, currentUserId);
    return { comments: data };
  }

  async deleteComment(currentUser: User, slug: string, commentId: number): Promise<void> {
    const article = await this.articlesService.findBySlugOrFail(slug);
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId, articleId: article.id },
    });
    if (!comment) {
      throw new NotFoundException({ id: ['not found'] });
    }
    if (comment.authorId !== currentUser.id) {
      throw new ForbiddenException('You can only delete your own comments');
    }
    await this.commentsRepository.remove(comment);
  }

  private async buildCommentDataList(
    comments: Comment[],
    currentUserId?: string,
  ): Promise<CommentData[]> {
    if (comments.length === 0) return [];

    const authorIds = [...new Set(comments.map((comment) => comment.authorId))];
    const followingSet = currentUserId
      ? await this.profilesService.getFollowingSet(currentUserId, authorIds)
      : new Set<string>();

    return comments.map((comment) => ({
      id: comment.id,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      body: comment.body,
      author: toProfile(comment.author, followingSet.has(comment.authorId)),
    }));
  }
}
