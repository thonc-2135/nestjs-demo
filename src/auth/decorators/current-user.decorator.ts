import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedRequestUser } from '../interfaces/authenticated-request-user.interface.js';

type CurrentUserKey = keyof AuthenticatedRequestUser;

export const CurrentUser = createParamDecorator(
  (data: CurrentUserKey | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const authPayload = request.user as AuthenticatedRequestUser;
    return data ? authPayload[data] : authPayload.user;
  },
);
