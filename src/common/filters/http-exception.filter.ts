import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const [status, errors] = this.resolve(exception);
    response.status(status).json({ errors });
  }

  private resolve(exception: unknown): [number, Record<string, string[]>] {
    if (!(exception instanceof HttpException)) {
      return [HttpStatus.INTERNAL_SERVER_ERROR, { body: ['Internal server error'] }];
    }

    const status = exception.getStatus();
    const body = exception.getResponse();

    if (typeof body === 'string') {
      return [status, { body: [body] }];
    }

    if (typeof body === 'object' && body !== null && 'message' in body) {
      const message = (body as { message: unknown }).message;
      return [status, { body: Array.isArray(message) ? message : [String(message)] }];
    }

    return [status, body as Record<string, string[]>];
  }
}
