import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityService } from '../../shared/services/entity.service';
import { Attendant } from '../entities/attendant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { FindOptionsWhere } from 'typeorm';
import { User } from '../../authentication/entities/user.entity';
import { Account } from '../entities/account.entity';
import { AttendantReqDto, AttendantUpdateDto } from '../dtos/station.dto';
import { MessageResDto } from '../../shared/dtos/shared.dto';
import { StationService } from './station.service';
import { deepMerge } from '../../shared/services/utility.service';
import { StaffService } from './staff.service';

@Injectable()
export class AttendantService extends EntityService<Attendant> {
  constructor(
    @InjectRepository(Attendant)
    private readonly attendantRepository: Repository<Attendant>,
    private readonly stationService: StationService,
    private readonly staffService: StaffService,
  ) {
    super();
    super.setRepository(this.attendantRepository);
  }

  attendantFilter(user: User, account: Account): FindOptionsWhere<Attendant> {
    if (user.isStaff) return {};
    return { organization: { id: account.organization.id } };
  }

  async addAttendant(
    payload: AttendantReqDto,
    user: User,
    account: Account,
  ): Promise<MessageResDto> {
    if (
      await this.filter({
        staff: { id: payload.staffId },
        station: { id: payload.stationId },
      })
    )
      throw new BadRequestException('Added already assigned to this station');

    const station = await this.stationService.filter(
      deepMerge(
        {
          id: payload.stationId,
        },
        this.stationService.stationFilter(user, account),
      ),
      { relations: { organization: true } },
    );
    if (!station) throw new BadRequestException('Station not found');

    const staff = await this.staffService.filter(
      deepMerge(
        {
          id: payload.stationId,
        },
        this.staffService.staffFilter(user, account),
      ),
      { relations: { account: true } },
    );
    if (!staff) throw new BadRequestException('Staff not found');

    await this.save({
      organization: station.organization,
      account: staff.account,
      staff: staff,
      station: station,
    });

    return { message: 'Attendant added successfully.' };
  }

  async updateAttendant(
    id: number,
    payload: AttendantUpdateDto,
    user: User,
    account: Account,
  ): Promise<MessageResDto> {
    const attendant = await this.filter(
      deepMerge({ id: id }, this.attendantFilter(user, account)),
    );
    if (!attendant) throw new BadRequestException('Attendant not found');

    if (payload.staffId) {
      const staff = await this.staffService.filter(
        deepMerge(
          {
            id: payload.staffId,
          },
          this.staffService.staffFilter(user, account),
        ),
        { relations: { account: true } },
      );
      if (!staff) throw new BadRequestException('Staff not found');

      attendant.account = staff.account;
      attendant.staff = staff;
    }

    if (payload.stationId) {
      const station = await this.stationService.filter(
        deepMerge(
          {
            id: payload.stationId,
          },
          this.stationService.stationFilter(user, account),
        ),
        { relations: { organization: true } },
      );
      if (!station) throw new BadRequestException('Staff not found');

      attendant.station = station;
      attendant.organization = station.organization;
    }

    await this.update({ id: id }, attendant);

    return { message: 'Attendant updated successfully.' };
  }
}
