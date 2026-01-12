import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];
    if (!authHeader)
      throw new UnauthorizedException('Authorization header is missing');

    const [scheme, token] = authHeader.split(' ');
    if (scheme != 'Bearer')
      throw new UnauthorizedException('Invalid authorization scheme');
    if (!token)
      throw new UnauthorizedException('Authorization token is required');

    const user = this.authService.decodeToken(token);
    request['user'] = user;
    request['token'] = token;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    request['account'] = user['account'];
    return true;
  }
}
