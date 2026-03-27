import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityService } from '../../shared/services/entity.service';
import { Pricing } from '../entities/pricing.entity';
import { Repository } from 'typeorm/repository/Repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../authentication/entities/user.entity';
import { FindOptionsWhere } from 'typeorm';
import { Account } from '../../onboarding/entities/account.entity';
import { PricingReqDto, PricingUpdateDto } from '../dtos/pricing.dtos';
import { MessageResDto } from '../../shared/dtos/shared.dto';
import { StationService } from '../../onboarding/services/station.service';
import { OrganizationService } from '../../onboarding/services/organization.service';
import { deepMerge } from '../../shared/services/utility.service';

@Injectable()
export class PricingService extends EntityService<Pricing> {
  constructor(
    @InjectRepository(Pricing)
    private readonly pricingRepository: Repository<Pricing>,
    private readonly organizationService: OrganizationService,
    private readonly stationService: StationService,
  ) {
    super();
    super.setRepository(this.pricingRepository);
  }

  pricingFilter(user: User, account: Account): FindOptionsWhere<Pricing> {
    if (user.isStaff) return {};
    return { organization: { id: account.organization.id } };
  }

  async setPricing(
    user: User,
    account: Account,
    payload: PricingReqDto,
  ): Promise<MessageResDto> {
    const pricing = new Pricing();
    let filters: FindOptionsWhere<Pricing> = { active: true };

    const organization = await this.organizationService.filter(
      deepMerge(
        { id: payload.organizationId },
        this.organizationService.organizationFilter(user, account),
      ),
    );
    if (!organization) throw new BadRequestException('Organization not found');
    pricing.organization = organization;
    filters = { ...filters, organization: { id: payload.organizationId } };

    if (payload.stationId) {
      const station = await this.stationService.filter(
        deepMerge(
          { id: payload.stationId },
          this.stationService.stationFilter(user, account),
        ),
      );
      if (!station) throw new BadRequestException('Station not found');
      pricing.station = station;
      filters = { ...filters, station: { id: station.id } };
    }

    pricing.units = payload.units;
    pricing.discrepancy = payload.discrepancy;
    pricing.sellingPrice = payload.sellingPrice;
    pricing.supplierPrice = payload.supplierPrice;
    pricing.active = true;
    pricing.account = account;

    await this.update(filters, { active: false, archivedOn: new Date() });
    await this.save(pricing);

    return { message: 'Pricing successfully configured' };
  }

  async updatePricing(
    id: number,
    payload: PricingUpdateDto,
    user: User,
    account: Account,
  ): Promise<MessageResDto> {
    let filters: FindOptionsWhere<Pricing> = { active: true };

    const pricing = await this.filter(
      deepMerge({ id: id }, this.pricingFilter(user, account)),
    );
    if (!pricing) throw new BadRequestException('Pricing not found');

    if (payload.organizationId) {
      const organization = await this.organizationService.filter(
        deepMerge(
          { id: payload.organizationId },
          this.organizationService.organizationFilter(user, account),
        ),
      );
      if (!organization)
        throw new BadRequestException('Organization not found');
      pricing.organization = organization;
      filters = { ...filters, organization: { id: payload.organizationId } };
    }

    if (payload.stationId) {
      const station = await this.stationService.filter(
        deepMerge(
          { id: payload.stationId },
          this.stationService.stationFilter(user, account),
        ),
      );
      if (!station) throw new BadRequestException('Station not found');
      pricing.station = station;
      filters = { ...filters, station: { id: station.id } };
    }

    if (payload.supplierPrice) pricing.supplierPrice = payload.supplierPrice;
    if (payload.units) pricing.sellingPrice = payload.sellingPrice;
    if (payload.discrepancy) pricing.discrepancy = payload.discrepancy;
    if (payload.sellingPrice) pricing.units = payload.units;

    if ('active' in payload) {
      pricing.active = payload.active;
      if (payload.active)
        await this.update(filters, { active: false, archivedOn: new Date() });
    }

    await this.update({ id: id }, pricing);

    return { message: 'Pricing successfully updated' };
  }
}
