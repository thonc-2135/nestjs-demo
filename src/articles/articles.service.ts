import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { toProfile } from '../profiles/mappers/profile-response.mapper.js';
import { ProfilesService } from '../profiles/profiles.service.js';
import type { User } from '../users/entities/user.entity.js';
import type { CreateArticleDto } from './dto/create-article.dto.js';
import type { FeedArticlesQueryDto } from './dto/feed-articles-query.dto.js';
import type { ListArticlesQueryDto } from './dto/list-articles-query.dto.js';
import type { UpdateArticleDto } from './dto/update-article.dto.js';
import { Article } from './entities/article.entity.js';
import { Favorite } from './entities/favorite.entity.js';
import { Tag } from './entities/tag.entity.js';
import type {
  ArticleData,
  ArticleResponse,
  ArticlesListResponse,
} from './mappers/article-response.mapper.js';
import { generateSlug } from './utils/slug.util.js';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
    @InjectRepository(Favorite)
    private readonly favoritesRepository: Repository<Favorite>,
    private readonly profilesService: ProfilesService,
  ) {}

  async create(author: User, dto: CreateArticleDto): Promise<ArticleResponse> {
    const tags = await this.findOrCreateTags(dto.article.tagList ?? []);

    const article = this.articlesRepository.create({
      slug: generateSlug(dto.article.title),
      title: dto.article.title,
      description: dto.article.description,
      body: dto.article.body,
      authorId: author.id,
      author,
      tags,
    });
    const saved = await this.articlesRepository.save(article);

    return this.toArticleResponse(saved, author.id);
  }

  async getBySlug(slug: string, currentUserId?: string): Promise<ArticleResponse> {
    const article = await this.findBySlugOrFail(slug);
    return this.toArticleResponse(article, currentUserId);
  }

  async update(
    currentUser: User,
    slug: string,
    dto: UpdateArticleDto,
  ): Promise<ArticleResponse> {
    const article = await this.findBySlugOrFail(slug);
    this.assertOwner(article, currentUser);

    if (dto.article.title !== undefined) article.title = dto.article.title;
    if (dto.article.description !== undefined) article.description = dto.article.description;
    if (dto.article.body !== undefined) article.body = dto.article.body;

    const saved = await this.articlesRepository.save(article);
    return this.toArticleResponse(saved, currentUser.id);
  }

  async remove(currentUser: User, slug: string): Promise<void> {
    const article = await this.findBySlugOrFail(slug);
    this.assertOwner(article, currentUser);
    await this.articlesRepository.remove(article);
  }

  async favorite(currentUser: User, slug: string): Promise<ArticleResponse> {
    const article = await this.findBySlugOrFail(slug);
    const exists = await this.favoritesRepository.exists({
      where: { userId: currentUser.id, articleId: article.id },
    });
    if (!exists) {
      await this.favoritesRepository.insert({ userId: currentUser.id, articleId: article.id });
    }
    return this.toArticleResponse(article, currentUser.id);
  }

  async unfavorite(currentUser: User, slug: string): Promise<ArticleResponse> {
    const article = await this.findBySlugOrFail(slug);
    await this.favoritesRepository.delete({ userId: currentUser.id, articleId: article.id });
    return this.toArticleResponse(article, currentUser.id);
  }

  async list(query: ListArticlesQueryDto, currentUserId?: string): Promise<ArticlesListResponse> {
    const qb = this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.tags', 'tag')
      .orderBy('article.createdAt', 'DESC')
      .skip(query.offset)
      .take(query.limit);

    if (query.tag) {
      qb.innerJoin('article.tags', 'filterTag', 'filterTag.name = :tagName', {
        tagName: query.tag,
      });
    }
    if (query.author) {
      qb.andWhere('author.username = :authorUsername', { authorUsername: query.author });
    }
    if (query.favorited) {
      qb.innerJoin('favorites', 'fav', 'fav.article_id = article.id').innerJoin(
        'users',
        'favUser',
        'favUser.id = fav.user_id AND favUser.username = :favoritedUsername',
        { favoritedUsername: query.favorited },
      );
    }

    const [articles, articlesCount] = await qb.getManyAndCount();
    const data = await this.buildArticleDataList(articles, currentUserId);
    return { articles: data, articlesCount };
  }

  async listTagNames(): Promise<{ tags: string[] }> {
    const tags = await this.tagsRepository.find({ order: { name: 'ASC' } });
    return { tags: tags.map((tag) => tag.name) };
  }

  async feed(currentUser: User, query: FeedArticlesQueryDto): Promise<ArticlesListResponse> {
    const followingIds = await this.profilesService.getFollowingIds(currentUser.id);
    if (followingIds.length === 0) {
      return { articles: [], articlesCount: 0 };
    }

    const [articles, articlesCount] = await this.articlesRepository.findAndCount({
      where: { authorId: In(followingIds) },
      relations: { author: true, tags: true },
      order: { createdAt: 'DESC' },
      skip: query.offset,
      take: query.limit,
    });

    const data = await this.buildArticleDataList(articles, currentUser.id);
    return { articles: data, articlesCount };
  }

  async findBySlugOrFail(slug: string): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { slug },
      relations: { author: true, tags: true },
    });
    if (!article) {
      throw new NotFoundException({ slug: ['not found'] });
    }
    return article;
  }

  private assertOwner(article: Article, currentUser: User): void {
    if (article.authorId !== currentUser.id) {
      throw new ForbiddenException("You can only modify your own articles");
    }
  }

  private async findOrCreateTags(names: string[]): Promise<Tag[]> {
    const uniqueNames = [...new Set(names)];
    if (uniqueNames.length === 0) return [];

    const existing = await this.tagsRepository.findBy({ name: In(uniqueNames) });
    const existingNames = new Set(existing.map((tag) => tag.name));
    const missingNames = uniqueNames.filter((name) => !existingNames.has(name));

    const created =
      missingNames.length > 0
        ? await this.tagsRepository.save(
            missingNames.map((name) => this.tagsRepository.create({ name })),
          )
        : [];

    return [...existing, ...created];
  }

  private async toArticleResponse(
    article: Article,
    currentUserId?: string,
  ): Promise<ArticleResponse> {
    const [data] = await this.buildArticleDataList([article], currentUserId);
    return { article: data };
  }

  private async buildArticleDataList(
    articles: Article[],
    currentUserId?: string,
  ): Promise<ArticleData[]> {
    if (articles.length === 0) return [];

    const articleIds = articles.map((article) => article.id);
    const authorIds = [...new Set(articles.map((article) => article.authorId))];

    const favoriteCountRows = await this.favoritesRepository
      .createQueryBuilder('f')
      .select('f.articleId', 'articleId')
      .addSelect('COUNT(*)', 'count')
      .where('f.articleId IN (:...articleIds)', { articleIds })
      .groupBy('f.articleId')
      .getRawMany<{ articleId: string; count: string }>();
    const favoriteCountMap = new Map(
      favoriteCountRows.map((row) => [row.articleId, Number(row.count)]),
    );

    const favoritedSet = currentUserId
      ? new Set(
          (
            await this.favoritesRepository.find({
              where: { userId: currentUserId, articleId: In(articleIds) },
              select: { articleId: true },
            })
          ).map((favorite) => favorite.articleId),
        )
      : new Set<string>();

    const followingSet = currentUserId
      ? await this.profilesService.getFollowingSet(currentUserId, authorIds)
      : new Set<string>();

    return articles.map((article) => ({
      slug: article.slug,
      title: article.title,
      description: article.description,
      body: article.body,
      tagList: article.tags.map((tag) => tag.name).sort(),
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
      favorited: favoritedSet.has(article.id),
      favoritesCount: favoriteCountMap.get(article.id) ?? 0,
      author: toProfile(article.author, followingSet.has(article.authorId)),
    }));
  }
}
