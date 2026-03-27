import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { EntityService } from '../../shared/services/entity.service';
import { Organization } from '../entities/organization.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { OrganizationReqDto } from '../dtos/organization.dto';
import { MessageResDto } from '../../shared/dtos/shared.dto';
import { User } from '../../authentication/entities/user.entity';
import { Account, AccountStatus } from '../entities/account.entity';
import { FindOptionsWhere } from 'typeorm';
import { deepMerge } from '../../shared/services/utility.service';
import { StorageService } from '../../shared/services/storage.service';
import { AccountService } from './account.service';
import { StaffService } from './staff.service';
import { RoleService } from '../../authorization/services/role.service';

@Injectable()
export class OrganizationService extends EntityService<Organization> {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly storageService: StorageService,
    private readonly accountService: AccountService,
    @Inject(forwardRef(() => StaffService))
    private readonly staffService: StaffService,
    private readonly roleService: RoleService,
  ) {
    super();
    this.setRepository(this.organizationRepository);
  }

  organizationFilter(
    user: User,
    account: Account,
  ): FindOptionsWhere<Organization> {
    if (user.isStaff) return {};
    return { id: account?.organization.id };
  }

  async register(
    payload: OrganizationReqDto,
    user: User,
    file?: Express.Multer.File,
  ): Promise<MessageResDto> {
    if (await this.filter({ code: payload.code }))
      throw new BadRequestException('Code already registered');

    if (file) {
      payload.logo = this.storageService.getFileName(file.originalname);
      await this.storageService.uploadFile(file, payload.logo);
    }

    const organization = await this.save(payload);

    if (!user.isStaff) {
      const account = await this.accountService.save({
        organization: organization,
        user: user,
        status: AccountStatus.APPROVED,
        isStaff: true,
        active: true,
      });

      await this.staffService.save({
        organization: organization,
        account: account,
        fullName: user.fullName,
        title: 'Account Admin',
        profile: user.profile,
      });

      await this.roleService.assignDefaultRole(account);
    }

    return { message: 'Successfully registered!' };
  }

  async updateOrganization(
    id: number,
    user: User,
    account: Account,
    payload: OrganizationReqDto,
    file?: Express.Multer.File,
  ): Promise<MessageResDto> {
    const organization = await this.filter(
      deepMerge<Organization>(
        { id: id },
        this.organizationFilter(user, account),
      ),
    );
    if (!organization) throw new BadRequestException('Organization not found!');

    if (
      organization.code != payload.code &&
      (await this.filter({ code: payload.code }))
    )
      throw new BadRequestException('Code already exists');

    if (file) {
      payload.logo = this.storageService.getFileName(file.originalname);
      await this.storageService.uploadFile(file, payload.logo);
    }

    await this.update({ id: id }, payload);

    return { message: 'Successfully updated!' };
  }
}
