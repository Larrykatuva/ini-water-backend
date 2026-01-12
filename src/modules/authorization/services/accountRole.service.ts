import { Injectable } from '@nestjs/common';
import { EntityService } from '../../shared/services/entity.service';
import { AccountRole } from '../entities/accountRole.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';

@Injectable()
export class AccountRoleService extends EntityService<AccountRole> {
  constructor(
    @InjectRepository(AccountRole)
    private readonly accountRoleRepository: Repository<AccountRole>,
  ) {
    super();
    super.setRepository(this.accountRoleRepository);
  }
}
