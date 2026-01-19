import { EntityService } from '../../shared/services/entity.service';
import { Station } from '../entities/station.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { Account } from '../entities/account.entity';
import { FindOptionsWhere } from 'typeorm';
import { User } from '../../authentication/entities/user.entity';
import { StationReqDto, StationUpdateDto } from '../dtos/station.dto';
import { MessageResDto } from '../../shared/dtos/shared.dto';
import { OrganizationService } from './organization.service';
import { deepMerge } from '../../shared/services/utility.service';
import { StorageService } from '../../shared/services/storage.service';

@Injectable()
export class StationService extends EntityService<Station> {
  constructor(
    @InjectRepository(Station)
    private readonly stationRepository: Repository<Station>,
    private readonly organizationService: OrganizationService,
    private readonly storageService: StorageService,
  ) {
    super();
    super.setRepository(this.stationRepository);
  }

  stationFilter(user: User, account: Account): FindOptionsWhere<Station> {
    if (user.isStaff) return {};
    return { organization: { id: account.organization.id } };
  }

  async registerStation(
    payload: StationReqDto,
    user: User,
    account: Account,
    file?: Express.Multer.File,
  ): Promise<MessageResDto> {
    const organization = await this.organizationService.filter(
      deepMerge(
        {
          id: payload.organizationId,
        },
        this.organizationService.organizationFilter(user, account),
      ),
    );
    if (!organization) throw new BadRequestException('Organization not found');

    if (
      await this.filter({
        organization: { id: payload.organizationId },
        name: payload.name,
      })
    )
      throw new BadRequestException('Organization with a given name exists');
    if (
      await this.filter({
        organization: { id: payload.organizationId },
        code: payload.code,
      })
    )
      throw new BadRequestException('Organization with a given code exists');

    if (file) {
      payload.profile = this.storageService.getFileName(file.originalname);
      await this.storageService.uploadFile(file, payload.profile);
    }

    await this.save({
      organization: organization,
      name: payload.name,
      code: payload.code,
      location: payload.location,
      profile: payload.profile,
      description: payload.description,
    });

    return { message: 'Station added successfully.' };
  }

  async updateStation(
    id: number,
    payload: StationUpdateDto,
    user: User,
    account: Account,
    file?: Express.Multer.File,
  ): Promise<MessageResDto> {
    const station = await this.filter(
      deepMerge({ id: id }, this.stationFilter(user, account)),
    );
    if (!station) throw new BadRequestException('Station not found');

    if (payload.organizationId) {
      const organization = await this.organizationService.filter(
        deepMerge(
          {
            id: payload.organizationId,
          },
          this.organizationService.organizationFilter(user, account),
        ),
      );
      if (!organization)
        throw new BadRequestException('Organization not found');
    }

    if ('status' in payload) station.status = payload.status;
    if (payload.name) station.description = payload.name;
    if (payload.code) station.code = payload.code;
    if (payload.location) station.location = payload.location;
    if (payload.description) station.description = payload.description;

    if (file) {
      station.profile = this.storageService.getFileName(file.originalname);
      await this.storageService.uploadFile(file, station.profile);
    }

    await this.update({ id: station.id }, station);

    return { message: 'Station updated successfully.' };
  }
}
