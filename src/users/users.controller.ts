import {
  Body,
  Controller,
  Get,
  Put,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentToken } from '../auth/decorators/current-token.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { avatarUploadOptions } from './avatar-upload.options.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';
import { toUserResponse, type UserResponse } from './mappers/user-response.mapper.js';
import { UsersService } from './users.service.js';

@ApiTags('user')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user' })
  getCurrentUser(
    @CurrentUser() user: User,
    @CurrentToken() token: string,
  ): UserResponse {
    return toUserResponse(user, token);
  }

  @Put()
  @ApiOperation({ summary: 'Update current user' })
  async updateCurrentUser(
    @CurrentUser() user: User,
    @CurrentToken() token: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponse> {
    const updated = await this.usersService.updateProfile(user, dto.user);
    return toUserResponse(updated, token);
  }

  @Post('avatar')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: "Upload current user's avatar" })
  @UseInterceptors(FileInterceptor('avatar', avatarUploadOptions))
  async uploadAvatar(
    @CurrentUser() user: User,
    @CurrentToken() token: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UserResponse> {
    const updated = await this.usersService.updateAvatar(user, file);
    return toUserResponse(updated, token);
  }
}
