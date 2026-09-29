import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';

class RegisterUserPayload {
  @ApiProperty({ example: '' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({ example: '' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '' })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ type: RegisterUserPayload })
  @ValidateNested()
  @Type(() => RegisterUserPayload)
  user: RegisterUserPayload;
}
