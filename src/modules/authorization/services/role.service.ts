import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityService } from '../../shared/services/entity.service';
import { Role } from '../entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { RoleReqDto, RoleUpdateDto } from '../dtos/roles.dto';
import { MessageResDto } from '../../shared/dtos/shared.dto';
import { FindOptionsWhere } from 'typeorm';
import { Account } from '../../onboarding/entities/account.entity';
import { User } from '../../authentication/entities/user.entity';
import { AccountRoleService } from './accountRole.service';
import {
  AccountRoleReqDto,
  AccountRoleUpdateDto,
} from '../dtos/accountRole.dto';
import { AccountService } from '../../onboarding/services/account.service';
import { AuthType } from '../entities/permission.entity';

@Injectable()
export class RoleService extends EntityService<Role> {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    private readonly accountRoleService: AccountRoleService,
    private readonly accountService: AccountService,
  ) {
    super();
    super.setRepository(this.roleRepository);
  }

  roleFilter(user: User, account?: Account): FindOptionsWhere<Role> {
    if (user.isStaff) return {};
    return { organization: { id: account?.organization?.id } };
  }

  async addNewRole(payload: RoleReqDto): Promise<MessageResDto> {
    if (await this.filter({ name: payload.name }))
      throw new BadRequestException('Role already exists');

    await this.save(payload);

    return { message: 'Role added successfully' };
  }

  async updateRole(
    id: number,
    payload: RoleUpdateDto,
    user: User,
    requestAccount: Account,
  ): Promise<MessageResDto> {
    const role = await this.filter({ id: id });
    if (!role) throw new BadRequestException('Role not found');

    if (
      !user.isStaff &&
      role.type === AuthType.External &&
      role.organization.id !== requestAccount.organization.id
    )
      throw new BadRequestException('Role not found');

    if (payload.name) role.name = payload.name;
    if ('active' in payload) role.active = payload.active;

    await this.update({ id: id }, role);

    return { message: 'Role updates successfully' };
  }

  async assignRole(
    payload: AccountRoleReqDto,
    user: User,
    requestAccount: Account,
  ): Promise<MessageResDto> {
    if (
      await this.accountRoleService.filter({
        account: { id: payload.accountId },
        role: { id: payload.roleId },
      })
    )
      throw new BadRequestException('Role already assign to this user account');

    const role = await this.filter({ id: payload.roleId });
    if (!role) throw new BadRequestException('Invalid role id');
    const account = await this.accountService.filter({ id: payload.accountId });
    if (!account) throw new BadRequestException('Invalid account id');

    if (!user.isStaff) {
      if (account.organization.id !== requestAccount.organization.id)
        throw new BadRequestException('Invalid account id');
      if (role.organization.id !== requestAccount.organization.id)
        throw new BadRequestException('Invalid role id');
    }

    await this.accountRoleService.save({ account: account, role: role });

    return { message: 'Role assigned successfully' };
  }

  async updateAssignedRole(
    id: number,
    payload: AccountRoleUpdateDto,
    user: User,
    requestAccount: Account,
  ): Promise<MessageResDto> {
    const accountRole = await this.accountRoleService.filter({ id: id });
    if (!accountRole) throw new BadRequestException('Account role not found');

    if (
      !user.isStaff &&
      accountRole.account.organization.id != requestAccount.organization.id
    )
      throw new BadRequestException('Account role not found');

    if (payload.roleId) {
      const role = await this.filter({ id: payload.roleId });
      if (!role) throw new BadRequestException('Role not found');

      if (
        role.type == AuthType.External &&
        role.organization.id != requestAccount.organization.id
      )
        throw new BadRequestException('Role not found');

      accountRole.role = role;
    }

    if ('active' in payload) accountRole.active = payload.active;

    await this.accountRoleService.update({ id: accountRole.id }, accountRole);

    return { message: 'Assigned role updated successfully' };
  }
}
