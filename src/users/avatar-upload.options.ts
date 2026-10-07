import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

export const avatarUploadOptions = {
  storage: diskStorage({
    destination: 'public/uploads/avatars',
    filename: (_req: unknown, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) => {
      callback(null, `${randomUUID()}${extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (
    _req: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      callback(
        new BadRequestException({ avatar: ['must be a jpeg, png, or webp image'] }),
        false,
      );
      return;
    }
    callback(null, true);
  },
};
