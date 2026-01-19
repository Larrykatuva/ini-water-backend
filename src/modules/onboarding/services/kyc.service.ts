import { Injectable } from '@nestjs/common';
import { EntityService } from '../../shared/services/entity.service';
import { Kyc } from '../entities/kyc.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { User } from '../../authentication/entities/user.entity';
import { Account } from '../entities/account.entity';
import { FindOptionsWhere } from 'typeorm';

@Injectable()
export class KycService extends EntityService<Kyc> {
  constructor(
    @InjectRepository(Kyc) private readonly kycRepository: Repository<Kyc>,
  ) {
    super();
  }

  kycFilter(user: User, account: Account): FindOptionsWhere<Kyc> {
    if (user.isStaff) return {};
    return { organization: { id: account.organization.id } };
  }
}
