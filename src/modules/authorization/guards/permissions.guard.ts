import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Request } from 'express';
import { SetPermission } from '../entities/permission.entity';
import { User } from '../../authentication/entities/user.entity';
import { AccountRoleService } from '../services/accountRole.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly accountRoleService: AccountRoleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<
      SetPermission[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'] as User;

    return await this.accountRoleService.checkAccountPermission(
      requiredPermissions,
      user,
    );
  }
}
