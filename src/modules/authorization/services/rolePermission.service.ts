import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityService } from '../../shared/services/entity.service';
import { RolePermission } from '../entities/rolePermission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import {
  RolePermissionReqDto,
  RolePermissionUpdateDto,
} from '../dtos/rolePermission.dto';
import { Account } from '../../onboarding/entities/account.entity';
import { MessageResDto } from '../../shared/dtos/shared.dto';
import { User } from '../../authentication/entities/user.entity';
import { PermissionsService } from './permissions.service';
import { RoleService } from './role.service';
import { AuthType } from '../entities/permission.entity';

@Injectable()
export class RolePermissionService extends EntityService<RolePermission> {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    private readonly permissionService: PermissionsService,
    private readonly roleService: RoleService,
  ) {
    super();
    super.setRepository(this.rolePermissionRepository);
  }

  async addPermission(
    payload: RolePermissionReqDto,
    user: User,
    requestAccount: Account,
  ): Promise<MessageResDto> {
    if (
      await this.filter({
        role: { id: payload.roleId },
        permission: { id: payload.permissionId },
      })
    )
      throw new BadRequestException('Permission already linked to this role');

    const permission = await this.permissionService.filter({
      id: payload.permissionId,
    });
    if (!permission) throw new BadRequestException('Permission not found');

    const role = await this.roleService.filter({ id: payload.roleId });
    if (!role) throw new BadRequestException('Role not found');

    if (
      !user.isStaff &&
      role.type === AuthType.External &&
      role.organization.id === requestAccount.organization.id
    )
      throw new BadRequestException('Role not found');

    await this.save({ permission: permission, role: role });

    return { message: 'Permission added successfully' };
  }

  async updatePermission(
    id: number,
    payload: RolePermissionUpdateDto,
    user: User,
    requestAccount: Account,
  ): Promise<MessageResDto> {
    const rolePermission = await this.filter(
      { id: id },
      { relations: { role: { organization: true } } },
    );
    if (!rolePermission)
      throw new BadRequestException('Role permission not found');

    if (
      !user.isStaff &&
      rolePermission.role.organization.id !== requestAccount.organization.id
    )
      throw new BadRequestException('Role not found');

    if (payload.roleId) {
      const role = await this.roleService.filter(
        { id: payload.roleId },
        { relations: { organization: true } },
      );
      if (!role) throw new BadRequestException('Role not found');
      if (
        role.type === AuthType.External &&
        role?.organization.id !== requestAccount.organization.id
      )
        throw new BadRequestException('Role not found');

      rolePermission.role = role;
    }

    if (payload.permissionId) {
      const permission = await this.permissionService.filter({
        id: payload.permissionId,
      });
      if (!permission) throw new BadRequestException('Permission not found');
      rolePermission.permission = permission;
    }

    if ('active' in payload) rolePermission.active = payload.active;

    await this.update({ id: id }, rolePermission);

    return { message: 'Permission added successfully' };
  }
}
