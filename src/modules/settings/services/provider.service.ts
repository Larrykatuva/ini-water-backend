import { Injectable } from '@nestjs/common';
import { EntityService } from '../../shared/services/entity.service';
import { Provider } from '../entities/provider.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';

@Injectable()
export class ProviderService extends EntityService<Provider> {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {
    super();
    super.setRepository(this.providerRepository);
  }
}
