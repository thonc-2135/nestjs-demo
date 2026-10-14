import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, MinLength, ValidateNested } from 'class-validator';

class CreateCommentPayload {
  @ApiProperty({ example: '' })
  @IsString()
  @MinLength(1)
  body: string;
}

export class CreateCommentDto {
  @ApiProperty({ type: CreateCommentPayload })
  @ValidateNested()
  @Type(() => CreateCommentPayload)
  comment: CreateCommentPayload;
}
