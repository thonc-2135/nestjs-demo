import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';
import { CommentsService } from './comments.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import type { CommentResponse, CommentsListResponse } from './mappers/comment-response.mapper.js';

@ApiTags('comments')
@Controller('articles/:slug/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add a comment to an article' })
  async create(
    @CurrentUser() currentUser: User,
    @Param('slug') slug: string,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentResponse> {
    return await this.commentsService.addComment(currentUser, slug, dto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get comments for an article' })
  list(
    @Param('slug') slug: string,
    @CurrentUser() currentUser?: User,
  ): Promise<CommentsListResponse> {
    return this.commentsService.listComments(slug, currentUser?.id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a comment' })
  async remove(
    @CurrentUser() currentUser: User,
    @Param('slug') slug: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.commentsService.deleteComment(currentUser, slug, id);
  }
}
