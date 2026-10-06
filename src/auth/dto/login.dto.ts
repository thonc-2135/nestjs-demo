import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsString, ValidateNested } from 'class-validator';

class LoginUserPayload {
  @ApiProperty({ example: '' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '' })
  @IsString()
  password: string;
}

export class LoginDto {
  @ApiProperty({ type: LoginUserPayload })
  @ValidateNested()
  @Type(() => LoginUserPayload)
  user: LoginUserPayload;
}
