import { EntityService } from '../../shared/services/entity.service';
import { Reading } from '../entities/reading.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { Injectable } from '@nestjs/common';
import { Account } from '../../onboarding/entities/account.entity';
import { FindOptionsWhere } from 'typeorm';
import { User } from '../../authentication/entities/user.entity';

@Injectable()
export class ReadingService extends EntityService<Reading> {
  constructor(
    @InjectRepository(Reading)
    private readonly readingRepository: Repository<Reading>,
  ) {
    super();
    super.setRepository(this.readingRepository);
  }

  readingFilter(user: User, account: Account): FindOptionsWhere<Reading> {
    if (user.isStaff) return {};
    return { organization: { id: account.organization.id } };
  }
}
