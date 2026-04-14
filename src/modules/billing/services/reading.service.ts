import { EntityService } from '../../shared/services/entity.service';
import { Reading } from '../entities/reading.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Account } from '../../onboarding/entities/account.entity';
import { FindOptionsWhere } from 'typeorm';
import { User } from '../../authentication/entities/user.entity';
import { ReadingReqDto, ReadingUpdateDto } from '../dtos/reading.dtos';
import { MessageResDto } from '../../shared/dtos/shared.dto';
import { StationService } from '../../onboarding/services/station.service';
import { deepMerge } from '../../shared/services/utility.service';
import { PricingService } from './pricing.services';

@Injectable()
export class ReadingService extends EntityService<Reading> {
  constructor(
    @InjectRepository(Reading)
    private readonly readingRepository: Repository<Reading>,
    private readonly stationService: StationService,
    private readonly pricingService: PricingService,
  ) {
    super();
    super.setRepository(this.readingRepository);
  }

  readingFilter(user: User, account: Account): FindOptionsWhere<Reading> {
    if (user.isStaff) return {};
    return { organization: { id: account.organization.id } };
  }

  expectedAmount(reading: Reading): number {
    return Number(
      (reading.pricing.sellingPrice * reading.volumeSold).toFixed(2),
    );
  }

  maximumDeficitAmount(reading: Reading): number {
    return Number(
      (reading.pricing.sellingPrice * reading.pricing.discrepancy).toFixed(2),
    );
  }

  getTodayDate(): Date {
    const today = new Date();

    const formatted =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');

    return new Date(formatted);
  }

  async addReading(
    account: Account,
    user: User,
    payload: ReadingReqDto,
  ): Promise<MessageResDto> {
    const station = await this.stationService.filter(
      deepMerge(
        { id: payload.stationId },
        this.stationService.stationFilter(user, account),
      ),
      { relations: { organization: true } },
    );
    if (!station) {
      throw new BadRequestException('Station not found');
    }

    const pricing = await this.pricingService.filter({
      station: { id: payload.stationId },
      active: true,
    });
    if (!pricing) throw new BadRequestException('Pricing not found');

    if (
      await this.filter({
        station: { id: payload.stationId },
        date: this.getTodayDate(),
      })
    )
      throw new BadRequestException('Reading already added for today');

    await this.save({
      organization: station.organization,
      station: station,
      pricing: pricing,
      volumeSold: payload.volumeSold,
      actionBy: account,
      date: this.getTodayDate(),
    });

    return { message: 'Reading successfully added' };
  }

  async updateReading(
    user: User,
    account: Account,
    id: number,
    payload: ReadingUpdateDto,
  ): Promise<MessageResDto> {
    const reading = await this.filter(
      deepMerge({ id: id }, this.readingFilter(user, account)),
    );
    if (!reading) throw new BadRequestException('Reading not found');

    if (reading.closed)
      throw new BadRequestException('Closed readings cannot be updated');

    reading.volumeSold = payload.volumeSold;

    await this.update({ id: id }, reading);

    return { message: 'Reading successfully updated' };
  }
}
