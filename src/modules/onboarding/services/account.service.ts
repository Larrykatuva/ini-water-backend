import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityService } from '../../shared/services/entity.service';
import { Account, NotificationChannel } from '../entities/account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { CacheService } from '../../shared/services/cache.service';
import { User } from '../../authentication/entities/user.entity';
import { FindOptionsWhere } from 'typeorm';
import { AccountNotificationReqDto } from '../dtos/organization.dto';
import { MessageResDto } from '../../shared/dtos/shared.dto';

@Injectable()
export class AccountService extends EntityService<Account> {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {
    super();
    this.setRepository(this.accountRepository);
  }

  accountsFilter(user: User, account: Account): FindOptionsWhere<Account> {
    if (user.isStaff) return {};
    return { organization: { id: account?.organization.id } };
  }

  async updateAccount(
    id: number,
    payload: AccountNotificationReqDto,
  ): Promise<MessageResDto> {
    const account = await this.filter({ id: id });

    if (!account) throw new BadRequestException('Account does not exist');

    switch (payload.channel) {
      case NotificationChannel.Phone: {
        account.allowPhoneNotifications = payload.enabled;
        break;
      }
      case NotificationChannel.Email: {
        account.allowEmailNotifications = payload.enabled;
        break;
      }
      case NotificationChannel.App: {
        account.allowApplicantNotifications = payload.enabled;
        break;
      }
    }

    await this.update({ id: id }, account);

    return { message: 'Notification channel configured successfully.' };
  }
}
