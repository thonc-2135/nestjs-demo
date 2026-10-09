import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';

class UpdateUserPayload {
  @ApiProperty({ example: '', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '', required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username?: string;

  @ApiProperty({ example: '', required: false })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password?: string;

  @ApiProperty({ example: '', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: '', required: false })
  @IsOptional()
  @IsString()
  image?: string;
}

export class UpdateUserDto {
  @ApiProperty({ type: UpdateUserPayload })
  @ValidateNested()
  @Type(() => UpdateUserPayload)
  user: UpdateUserPayload;
}
