import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityService } from '../../shared/services/entity.service';
import { Settlement } from '../entities/settlement.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { OrganizationService } from '../../onboarding/services/organization.service';
import { StationService } from '../../onboarding/services/station.service';
import { SettlementReqDto, SettlementUpdateDto } from '../dtos/settlement.dtos';
import { MessageResDto } from '../../shared/dtos/shared.dto';
import { User } from '../../authentication/entities/user.entity';
import { Account } from '../../onboarding/entities/account.entity';
import { deepMerge } from '../../shared/services/utility.service';
import { FindOptionsWhere } from 'typeorm';
import { ProviderService } from '../../settings/services/provider.service';

@Injectable()
export class SettlementService extends EntityService<Settlement> {
  constructor(
    @InjectRepository(Settlement)
    private readonly settlementRepository: Repository<Settlement>,
    private readonly organizationService: OrganizationService,
    private readonly stationService: StationService,
    private readonly providerService: ProviderService,
  ) {
    super();
    super.setRepository(this.settlementRepository);
  }

  settlementFilter(user: User, account: Account): FindOptionsWhere<Settlement> {
    if (user.isStaff) return {};
    return { organization: { id: account.organization.id } };
  }

  async configureSettlement(
    user: User,
    account: Account,
    payload: SettlementReqDto,
  ): Promise<MessageResDto> {
    const settlement = new Settlement();
    let filters: FindOptionsWhere<Settlement> = {
      active: true,
      purpose: payload.purpose,
      target: payload.target,
    };

    const organization = await this.organizationService.filter(
      deepMerge(
        { id: payload.organizationId },
        this.organizationService.organizationFilter(user, account),
      ),
    );
    if (!organization) throw new BadRequestException('Organization not found');
    settlement.organization = organization;

    const provider = await this.providerService.filter({
      id: payload.providerId,
    });
    if (!provider) throw new BadRequestException('Provider not found');
    settlement.provider = provider;
    filters = { ...filters, provider: { id: provider.id } };

    if (payload.stationId) {
      const station = await this.stationService.filter(
        deepMerge(
          { id: payload.stationId },
          this.stationService.stationFilter(user, account),
        ),
      );
      if (!station) throw new BadRequestException('Station not found');
      settlement.station = station;
      filters = { ...filters, station: { id: station.id } };
    }

    settlement.target = payload.target;
    settlement.purpose = payload.purpose;
    settlement.accountNumber = payload.accountNumber;
    settlement.reference = payload.reference;
    settlement.description = payload.description;

    await this.update(filters, { active: false });
    await this.save(settlement);

    return { message: 'Settlement account set successfully.' };
  }

  async updateSettlement(
    id: number,
    user: User,
    account: Account,
    payload: SettlementUpdateDto,
  ): Promise<MessageResDto> {
    const settlement = await this.filter(
      deepMerge({ id: id }, this.settlementFilter(user, account)),
    );
    if (!settlement) throw new BadRequestException('Settlement not found');
    let filters: FindOptionsWhere<Settlement> = {
      active: true,
      purpose: payload.purpose ? payload.purpose : settlement.purpose,
      target: payload.target ? payload.target : settlement.target,
    };

    if (payload.organizationId) {
      const organization = await this.organizationService.filter(
        deepMerge(
          { id: payload.organizationId },
          this.organizationService.organizationFilter(user, account),
        ),
      );
      if (!organization)
        throw new BadRequestException('Organization not found');
      settlement.organization = organization;
      filters = { ...filters, organization: { id: organization.id } };
    }

    if (payload.stationId) {
      const station = await this.stationService.filter(
        deepMerge(
          { id: payload.stationId },
          this.stationService.stationFilter(user, account),
        ),
      );
      if (!station) throw new BadRequestException('Station not found');
      settlement.station = station;
      filters = { ...filters, station: { id: station.id } };
    }

    if (payload.providerId) {
      const provider = await this.providerService.filter({
        id: payload.providerId,
      });
      if (!provider) throw new BadRequestException('Provider not found');
      settlement.provider = provider;
      filters = { ...filters, provider: { id: provider.id } };
    }

    if (payload.accountNumber) settlement.accountNumber = payload.accountNumber;
    if (payload.reference) settlement.reference = payload.reference;
    if (payload.description) settlement.description = payload.description;
    if (payload.target) settlement.target = payload.target;

    if ('active' in payload) {
      settlement.active = payload.active;
      if (payload.active) await this.update(filters, { active: false });
    }

    await this.update({ id: id }, settlement);

    return { message: 'Settlement account updated successfully.' };
  }
}
