import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ArticlesService } from './articles.service.js';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @ApiOperation({ summary: 'List all tags' })
  list(): Promise<{ tags: string[] }> {
    return this.articlesService.listTagNames();
  }
}
