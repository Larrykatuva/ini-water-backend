import { Injectable } from '@nestjs/common';
import { EntityService } from '../../shared/services/entity.service';
import { Account } from '../entities/account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { CacheService } from '../../shared/services/cache.service';
import { User } from '../../authentication/entities/user.entity';
import { FindOptionsWhere } from 'typeorm';

@Injectable()
export class AccountService extends EntityService<Account> {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private cacheService: CacheService,
  ) {
    super();
    this.setRepository(this.accountRepository);
  }

  accountsFilter(user: User, account: Account): FindOptionsWhere<Account> {
    if (user.isStaff) return {};
    return { organization: { id: account?.organization.id } };
  }
}
