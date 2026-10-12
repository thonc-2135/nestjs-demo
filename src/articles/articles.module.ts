import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesModule } from '../profiles/profiles.module.js';
import { ArticlesController } from './articles.controller.js';
import { ArticlesService } from './articles.service.js';
import { Article } from './entities/article.entity.js';
import { Favorite } from './entities/favorite.entity.js';
import { Tag } from './entities/tag.entity.js';
import { TagsController } from './tags.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Article, Tag, Favorite]), ProfilesModule],
  controllers: [ArticlesController, TagsController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
