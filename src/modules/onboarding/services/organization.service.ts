import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityService } from '../../shared/services/entity.service';
import { Organization } from '../entities/organization.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { OrganizationReqDto } from '../dtos/organization.dto';
import { MessageResDto } from '../../shared/dtos/shared.dto';
import { User } from '../../authentication/entities/user.entity';
import { Account } from '../entities/account.entity';
import { FindOptionsWhere } from 'typeorm';
import { deepMerge } from '../../shared/services/utility.service';
import { StorageService } from '../../shared/services/storage.service';

@Injectable()
export class OrganizationService extends EntityService<Organization> {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly storageService: StorageService,
  ) {
    super();
    this.setRepository(this.organizationRepository);
  }

  organizationFilter(
    user: User,
    account: Account,
  ): FindOptionsWhere<Organization> {
    if (user.isStaff) return {};
    return { id: account.organization.id };
  }

  async register(
    payload: OrganizationReqDto,
    file?: Express.Multer.File,
  ): Promise<MessageResDto> {
    if (await this.filter({ code: payload.code }))
      throw new BadRequestException('Code already registered');

    if (file) {
      payload.logo = this.storageService.getFileName(file.originalname);
      await this.storageService.uploadFile(file, payload.logo);
    }

    await this.save(payload);

    return { message: 'Successfully registered!' };
  }

  async updateOrganization(
    id: number,
    user: User,
    account: Account,
    payload: OrganizationReqDto,
    file?: Express.Multer.File,
  ): Promise<MessageResDto> {
    const organization = await this.filter(
      deepMerge(this.organizationFilter(user, account), { id: id }),
    );
    if (!organization) throw new BadRequestException('Organization not found!');

    if (
      organization.code != payload.code &&
      (await this.filter({ code: payload.code }))
    )
      throw new BadRequestException('Code already exists');

    if (file) {
      payload.logo = this.storageService.getFileName(file.originalname);
      await this.storageService.uploadFile(file, payload.logo);
    }

    await this.update({ id: id }, payload);

    return { message: 'Successfully updated!' };
  }
}
