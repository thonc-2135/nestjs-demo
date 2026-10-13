import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';

class UpdateArticlePayload {
  @ApiProperty({ example: '', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @ApiProperty({ example: '', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @ApiProperty({ example: '', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  body?: string;
}

export class UpdateArticleDto {
  @ApiProperty({ type: UpdateArticlePayload })
  @ValidateNested()
  @Type(() => UpdateArticlePayload)
  article: UpdateArticlePayload;
}
