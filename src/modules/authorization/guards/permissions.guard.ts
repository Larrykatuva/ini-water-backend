import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Request } from 'express';
import { SetPermission } from '../entities/permission.entity';
import { StaffRoleService } from '../services/staffRole.service';
import { User } from '../../authentication/entities/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private staffRoleService: StaffRoleService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<
      SetPermission[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'] as User;
    const userPermissions =
      await this.staffRoleService.getStaffPermissions(user);
    if (userPermissions.length == 0) return false;
    if (
      requiredPermissions.every((requiredPermission: SetPermission) =>
        userPermissions.includes(requiredPermission),
      )
    )
      throw new UnauthorizedException();
    return true;
  }
}
