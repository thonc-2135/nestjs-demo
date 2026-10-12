import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ArticlesService } from './articles.service.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';
import { CreateArticleDto } from './dto/create-article.dto.js';
import { FeedArticlesQueryDto } from './dto/feed-articles-query.dto.js';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto.js';
import { UpdateArticleDto } from './dto/update-article.dto.js';
import { User } from '../users/entities/user.entity.js';
import type { ArticleResponse, ArticlesListResponse } from './mappers/article-response.mapper.js';

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'List articles (with tag/author/favorited filters + pagination)' })
  list(
    @Query() query: ListArticlesQueryDto,
    @CurrentUser() currentUser?: User,
  ): Promise<ArticlesListResponse> {
    return this.articlesService.list(query, currentUser?.id);
  }

  @Get('feed')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Feed of articles from followed authors' })
  feed(
    @CurrentUser() currentUser: User,
    @Query() query: FeedArticlesQueryDto,
  ): Promise<ArticlesListResponse> {
    return this.articlesService.feed(currentUser, query);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create an article' })
  async create(
    @CurrentUser() currentUser: User,
    @Body() dto: CreateArticleDto,
  ): Promise<ArticleResponse> {
    return await this.articlesService.create(currentUser, dto);
  }

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get an article by slug' })
  getBySlug(
    @Param('slug') slug: string,
    @CurrentUser() currentUser?: User,
  ): Promise<ArticleResponse> {
    return this.articlesService.getBySlug(slug, currentUser?.id);
  }

  @Put(':slug')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update an article' })
  async update(
    @CurrentUser() currentUser: User,
    @Param('slug') slug: string,
    @Body() dto: UpdateArticleDto,
  ): Promise<ArticleResponse> {
    return await this.articlesService.update(currentUser, slug, dto);
  }

  @Delete(':slug')
  @HttpCode(204)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete an article' })
  async remove(@CurrentUser() currentUser: User, @Param('slug') slug: string): Promise<void> {
    await this.articlesService.remove(currentUser, slug);
  }

  @Post(':slug/favorite')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Favorite an article' })
  async favorite(
    @CurrentUser() currentUser: User,
    @Param('slug') slug: string,
  ): Promise<ArticleResponse> {
    return await this.articlesService.favorite(currentUser, slug);
  }

  @Delete(':slug/favorite')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Unfavorite an article' })
  async unfavorite(
    @CurrentUser() currentUser: User,
    @Param('slug') slug: string,
  ): Promise<ArticleResponse> {
    return await this.articlesService.unfavorite(currentUser, slug);
  }
}
