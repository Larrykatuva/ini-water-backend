import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityService } from '../../shared/services/entity.service';
import { Invite, InviteStatus } from '../entities/invite.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { User } from '../../authentication/entities/user.entity';
import { Account } from '../entities/account.entity';
import { FindOptionsWhere } from 'typeorm';
import { InviteReqDto } from '../dtos/staff.dto';
import { MessageResDto } from '../../shared/dtos/shared.dto';
import { OrganizationService } from './organization.service';
import { deepMerge } from '../../shared/services/utility.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class InviteService extends EntityService<Invite> {
  constructor(
    @InjectRepository(Invite)
    private readonly inviteRepository: Repository<Invite>,
    private readonly organizationService: OrganizationService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
    super.setRepository(this.inviteRepository);
  }

  inviteFilter(user: User, account: Account): FindOptionsWhere<Invite> {
    if (user.isStaff) return {};
    return { organization: { id: account.organization.id } };
  }

  async inviteUser(
    user: User,
    account: Account,
    payload: InviteReqDto,
  ): Promise<MessageResDto> {
    const organization = await this.organizationService.filter(
      deepMerge(
        {
          id: payload.organizationId,
        },
        this.organizationService.organizationFilter(user, account),
      ),
    );
    if (!organization) throw new BadRequestException('Organization not found');

    let invite = await this.filter(
      {
        email: payload.email,
        organization: { id: organization.id },
      },
      { relations: { organization: true, actionBy: true } },
    );
    if (invite) {
      invite.actionBy = account;
      invite.status = InviteStatus.PENDING;
    } else {
      invite = await this.save({
        email: payload.email,
        status: InviteStatus.PENDING,
        organization: organization,
        actionBy: account,
      });
    }

    this.eventEmitter.emit('organization.invite.created', {
      context: {
        invite: invite,
      },
      subject: 'Account Invitation',
      email: payload.email,
    });

    return {
      message: 'Invite created and acceptance link shared successfully.',
    };
  }
}
