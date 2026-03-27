import { EntityService } from '../../shared/services/entity.service';
import { KycStatus } from '../entities/kycStatus.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { User } from '../../authentication/entities/user.entity';
import { Account } from '../entities/account.entity';
import { FindOptionsWhere } from 'typeorm';

@Injectable()
export class KycStatusService extends EntityService<KycStatus> {
  constructor(
    @InjectRepository(KycStatus)
    private readonly kycStatusRepository: Repository<KycStatus>,
  ) {
    super();
    super.setRepository(this.kycStatusRepository);
  }

  kycStatusFilter(user: User, account: Account): FindOptionsWhere<KycStatus> {
    if (user.isStaff) return {};
    if (account.isStaff)
      return { organization: { id: account.organization.id } };
    return {
      organization: { id: account.organization.id },
      account: { id: account.id },
    };
  }
}
