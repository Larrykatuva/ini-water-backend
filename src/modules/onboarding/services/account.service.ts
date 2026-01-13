import { Injectable } from '@nestjs/common';
import { EntityService } from '../../shared/services/entity.service';
import { Account } from '../entities/account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
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

}
