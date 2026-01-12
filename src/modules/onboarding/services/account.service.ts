import { Injectable } from '@nestjs/common';
import { EntityService } from '../../shared/services/entity.service';
import { Account } from '../entities/account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { User } from '../../authentication/entities/user.entity';
import { CacheService } from '../../shared/services/cache.service';

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

  async getAccount(userId: number): Promise<Account | null> {
    const cachedAccount = await this.cacheService.get<Account>(
      `-user-account-${userId}`,
    );
    if (cachedAccount) return cachedAccount;

    const account = await this.filter({ user: { id: userId }, active: true });
    if (!account) return null;

    await this.cacheService.save<Account>(`-user-account-${userId}`, account);
    return account;
  }
}
