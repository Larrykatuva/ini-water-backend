import { Injectable } from '@nestjs/common';
import { EntityService } from '../../shared/services/entity.service';
import { AccountRole } from '../entities/accountRole.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { SetPermission } from '../entities/permission.entity';
import { User } from '../../authentication/entities/user.entity';
import { CacheService } from '../../shared/services/cache.service';
import { RolePermissionService } from './rolePermission.service';
import { In } from 'typeorm';

@Injectable()
export class AccountRoleService extends EntityService<AccountRole> {
  constructor(
    @InjectRepository(AccountRole)
    private readonly accountRoleRepository: Repository<AccountRole>,
    private readonly cacheService: CacheService,
    private readonly rolePermissionService: RolePermissionService,
  ) {
    super();
    super.setRepository(this.accountRoleRepository);
  }

  async getAccountPermissions(user: User): Promise<SetPermission[]> {
    const cachedPermissions = await this.cacheService.get<SetPermission[]>(
      `permission-names-${user.id}`,
    );

    if (cachedPermissions) return cachedPermissions;

    const userRoles = await this.filterMany(
      { account: { user: { id: user.id } }, role: { active: true } },
      { relations: { role: true } },
    );

    if (userRoles.length == 0) return [];

    const roleIds = userRoles.map((userRole) => userRole.role.id);

    const rolePermissions = await this.rolePermissionService.filterMany(
      { role: { id: In(roleIds) } },
      { relations: { permission: true } },
    );

    const permissionNames = rolePermissions.map(
      (rolePermission) => rolePermission.permission.name,
    );

    await this.cacheService.save<SetPermission[]>(
      `permission-names-${user.id}`,
      permissionNames,
      30000,
    );

    return permissionNames;
  }

  async checkAccountPermission(
    permissions: SetPermission[],
    user: User,
  ): Promise<boolean> {
    const accountPermissions = await this.getAccountPermissions(user);

    return permissions.every((permission) =>
      accountPermissions.includes(permission),
    );
  }
}
