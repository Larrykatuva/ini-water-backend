import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from '../entities/country.entity';
import { Repository } from 'typeorm/repository/Repository';
import { EntityService } from '../../shared/services/entity.service';

@Injectable()
export class CountryService extends EntityService<Country> {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {
    super();
    super.setRepository(this.countryRepository);
  }
}
