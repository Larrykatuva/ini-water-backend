import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityService } from '../../shared/services/entity.service';
import { Staff } from '../entities/staff.entity';
import { Repository } from 'typeorm/repository/Repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../authentication/entities/user.entity';
import { Account, AccountStatus } from '../entities/account.entity';
import { FindOptionsWhere } from 'typeorm';
import { MessageResDto } from '../../shared/dtos/shared.dto';
import { StaffReqDto, StaffUpdateDto } from '../dtos/staff.dto';
import { deepMerge } from '../../shared/services/utility.service';
import { StorageService } from '../../shared/services/storage.service';
import { UserService } from '../../authentication/services/user.service';
import { OrganizationService } from './organization.service';
import { AccountService } from './account.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class StaffService extends EntityService<Staff> {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    private readonly storageService: StorageService,
    private readonly userService: UserService,
    private readonly organizationService: OrganizationService,
    private readonly accountService: AccountService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
    super.setRepository(this.staffRepository);
  }

  staffFilter(user: User, account: Account): FindOptionsWhere<Staff> {
    if (user.isStaff) return {};
    return { organization: { id: account.organization.id } };
  }

  async addStaff(
    requestUser: User,
    account: Account,
    payload: StaffReqDto,
    file?: Express.Multer.File,
  ): Promise<MessageResDto> {
    const user = await this.userService.filter({ id: payload.userId });
    if (!user) throw new BadRequestException('User not found');

    const organization = await this.organizationService.filter(
      deepMerge(
        { id: payload.organizationId },
        this.organizationService.organizationFilter(requestUser, account),
      ),
    );
    if (!organization) throw new BadRequestException('Organization not found');

    if (
      await this.filter({
        organization: { id: organization.id },
        account: { user: { id: user.id } },
      })
    )
      throw new BadRequestException(
        'Staff member already added to this organization',
      );

    if (file) {
      payload.profile = this.storageService.getFileName(file.originalname);
      await this.storageService.uploadFile(file, payload.profile);
    }

    let userAccount = await this.accountService.filter(
      {
        user: { id: user.id },
        organization: { id: organization.id },
      },
      { relations: { user: true, organization: true } },
    );
    if (!userAccount) {
      userAccount = await this.accountService.save({
        organization: organization,
        user: user,
        status: AccountStatus.APPROVED,
        active: true,
      });
    }

    const staff = await this.save({
      organization: organization,
      account: userAccount,
      fullName: payload.fullName,
      title: payload.title,
      profile: payload.profile,
    });

    this.eventEmitter.emit('organization.staff.add', {
      context: {
        staff: staff,
      },
      subject: 'Staff Invite',
      email: user.email,
    });

    return { message: 'Staff member added the organization successfully' };
  }

  async updateStaff(
    id: number,
    user: User,
    account: Account,
    payload: StaffUpdateDto,
    file?: Express.Multer.File,
  ): Promise<MessageResDto> {
    const staff = await this.filter(
      deepMerge({ id: id }, this.staffFilter(user, account)),
    );
    if (!staff) throw new BadRequestException('Staff not found');

    if (file) {
      payload.profile = this.storageService.getFileName(file.originalname);
      await this.storageService.uploadFile(file, payload.profile);
    }

    await this.update({ id: id }, payload);

    const updatedStaff = await this.filter({ id: id });

    if ('active' in payload) {
      this.eventEmitter.emit('organization.staff.add', {
        context: {
          staff: updatedStaff,
        },
        subject: `Staff Account ${updatedStaff?.active ? 'Activated' : 'Deactivated'}`,
        email: user.email,
      });
    }

    return { message: 'Successfully updated!' };
  }
}
