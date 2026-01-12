import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Account } from '../../onboarding/entities/account.entity';

export interface AuthenticatedRequest extends Request {
  user: User;
  token: string;
  account: Account;
}

export const RequestUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    return request.user;
  },
);

export const RequestToken = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    return request.token;
  },
);

export const RequestUserAccount = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Account => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    return request.account;
  },
);
