import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesModule } from '../articles/articles.module.js';
import { ProfilesModule } from '../profiles/profiles.module.js';
import { CommentsController } from './comments.controller.js';
import { CommentsService } from './comments.service.js';
import { Comment } from './entities/comment.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), ArticlesModule, ProfilesModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
