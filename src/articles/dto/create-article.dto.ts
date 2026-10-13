import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';

class CreateArticlePayload {
  @ApiProperty({ example: '' })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({ example: '' })
  @IsString()
  @MinLength(1)
  description: string;

  @ApiProperty({ example: '' })
  @IsString()
  @MinLength(1)
  body: string;

  @ApiProperty({ example: [], required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagList?: string[];
}

export class CreateArticleDto {
  @ApiProperty({ type: CreateArticlePayload })
  @ValidateNested()
  @Type(() => CreateArticlePayload)
  article: CreateArticlePayload;
}
