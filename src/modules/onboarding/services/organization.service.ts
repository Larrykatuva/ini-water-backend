import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityService } from '../../shared/services/entity.service';
import { Organization } from '../entities/organization.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { OrganizationReqDto } from '../dtos/organization.dto';
import { MessageResDto } from '../../shared/dtos/shared.dto';

@Injectable()
export class OrganizationService extends EntityService<Organization> {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {
    super();
    this.setRepository(this.organizationRepository);
  }

  async register(payload: OrganizationReqDto): Promise<MessageResDto> {
    if (await this.filter({ code: payload.code }))
      throw new BadRequestException('Code already registered');

    await this.save(payload);

    return { message: 'Successfully registered!' };
  }
}
