import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityService } from '../../shared/services/entity.service';
import { Requirement, RequirementType } from '../entities/requirement.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { User } from '../../authentication/entities/user.entity';
import { Account } from '../entities/account.entity';
import { FindOptionsWhere } from 'typeorm';
import { RequirementReqDto, RequirementUpdateDto } from '../dtos/kyc.dto';
import { OrganizationService } from './organization.service';
import { deepMerge } from '../../shared/services/utility.service';
import { MessageResDto } from '../../shared/dtos/shared.dto';

@Injectable()
export class RequirementService extends EntityService<Requirement> {
  constructor(
    @InjectRepository(Requirement)
    private readonly requirementRepository: Repository<Requirement>,
    private readonly organizationService: OrganizationService,
  ) {
    super();
    super.setRepository(this.requirementRepository);
  }

  requirementFilter(
    user: User,
    account: Account,
  ): FindOptionsWhere<Requirement> {
    if (user.isStaff) return {};
    return { organization: { id: account.organization.id } };
  }

  async addRequirement(
    user: User,
    account: Account,
    payload: RequirementReqDto,
  ): Promise<MessageResDto> {
    if (
      await this.filter({
        organization: { id: payload.organizationId },
        name: payload.name,
      })
    )
      throw new BadRequestException('Requirement already configured');

    const organization = await this.organizationService.filter(
      deepMerge(
        {
          id: payload.organizationId,
        },
        this.organizationService.organizationFilter(user, account),
      ),
    );
    if (!organization) throw new BadRequestException('Organization not found');

    await this.save({
      organization: organization,
      type: RequirementType.ORGANIZATION,
      name: payload.name,
      input: payload.input,
      required: payload.required,
      comment: payload.comment,
    });

    return { message: 'Requirement configured successfully' };
  }

  async updateRequirement(
    id: number,
    user: User,
    account: Account,
    payload: RequirementUpdateDto,
  ): Promise<MessageResDto> {
    const requirement = await this.filter(
      { id: id },
      { relations: { organization: true } },
    );
    if (!requirement) throw new BadRequestException('Requirement not found');

    if (!user.isStaff) {
      if (requirement.organization.id !== account.organization.id)
        throw new BadRequestException('Requirement not found');
      if (payload.organizationId) {
        const organization = await this.organizationService.filter({
          id: payload.organizationId,
        });
        if (!organization)
          throw new BadRequestException('Organization not found');

        if (payload.organizationId === requirement.organization.id)
          throw new BadRequestException('Organization not found');

        requirement.organization = organization;
      }
    }

    if (payload.name) requirement.name = payload.name;
    if (payload.input) requirement.input = payload.input;
    if (payload.comment) requirement.comment = payload.comment;
    if ('required' in payload) requirement.required = payload.required;

    await this.update({ id: id }, requirement);

    return { message: 'Requirement updated successfully' };
  }
}
