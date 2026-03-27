import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityService } from '../../shared/services/entity.service';
import { Kyc } from '../entities/kyc.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { User } from '../../authentication/entities/user.entity';
import { Account } from '../entities/account.entity';
import { FindOptionsWhere } from 'typeorm';
import { MessageResDto } from '../../shared/dtos/shared.dto';
import { OrganizationService } from './organization.service';
import { deepMerge } from '../../shared/services/utility.service';
import { RequirementService } from './requirement.service';
import {
  Requirement,
  RequirementInput,
  RequirementType,
} from '../entities/requirement.entity';
import { StorageService } from '../../shared/services/storage.service';
import {
  Organization,
  OrganizationStatus,
} from '../entities/organization.entity';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { KycUpdateDto } from '../dtos/kyc.dto';

@Injectable()
export class KycService extends EntityService<Kyc> {
  constructor(
    @InjectRepository(Kyc) private readonly kycRepository: Repository<Kyc>,
    private readonly organizationService: OrganizationService,
    private readonly requirementService: RequirementService,
    private readonly storageService: StorageService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
    super.setRepository(this.kycRepository);
  }

  kycMemberFilter(user: User, account: Account): FindOptionsWhere<Kyc> {
    if (user.isStaff) return {};
    if (account.isStaff)
      return {
        organization: { id: account.organization.id },
      };
    return {
      organization: {
        id: account.organization.id,
      },
      account: { id: account.id },
    };
  }

  kycFilter(user: User, account: Account): FindOptionsWhere<Kyc> {
    if (user.isStaff) return {};
    return { organization: { id: account.organization.id } };
  }

  async validatedRequirements(
    payload: object,
    type: RequirementType,
    organization?: Organization,
  ): Promise<{ requirement: Requirement; value: string }[]> {
    const entries = Object.entries(payload);

    return await Promise.all(
      entries.map(async ([key, value]) => {
        const filters: FindOptionsWhere<Requirement> = {
          id: Number(key),
          type: type,
        };

        if (organization) filters.organization = { id: organization.id };

        const exists = await this.requirementService.filter(filters);

        if (!exists) {
          throw new BadRequestException(`Requirement not found`);
        }

        return {
          requirement: exists,
          value: value as unknown as string,
        };
      }),
    );
  }

  async validatedFiles(
    files: Express.Multer.File[],
    type: RequirementType,
    organization?: Organization,
  ): Promise<{ requirement: Requirement; file: Express.Multer.File }[]> {
    if (!files) return [];

    return await Promise.all(
      files.map(async (file) => {
        const requirementId = file.originalname.split('.')[0];

        const filters: FindOptionsWhere<Requirement> = {
          id: Number(requirementId),
          type: type,
          input: RequirementInput.FILE,
        };

        if (organization) filters.organization = { id: organization.id };

        const exists = await this.requirementService.filter(filters);

        if (!exists) {
          throw new BadRequestException(`Requirement not found`);
        }

        return {
          requirement: exists,
          file,
        };
      }),
    );
  }

  async processRequirementFiles(
    validatedFiles: { requirement: Requirement; file: Express.Multer.File }[],
    organization: Organization,
    account?: Account,
  ): Promise<void> {
    await Promise.all(
      validatedFiles.map(async ({ requirement, file }) => {
        const filename = this.storageService.getFileName(file.originalname);

        await this.storageService.uploadFile(file, filename);

        const filters: FindOptionsWhere<Kyc> = {
          requirement: { id: requirement.id },
          organization: { id: organization.id },
        };

        if (account) filters.account = { id: account.id };

        const exists = await this.filter(filters);

        if (exists) {
          await this.update(filters, {
            value: filename,
            account: exists.account,
            verified: false,
          });
        } else {
          await this.save({
            requirement,
            organization,
            value: filename,
            account: account ? account : undefined,
          });
        }
      }),
    );
  }

  async processRequirementsInputs(
    validatedInputs: { requirement: Requirement; value: string }[],
    organization: Organization,
    account?: Account,
  ): Promise<void> {
    await Promise.all(
      validatedInputs.map(async ({ requirement, value }) => {
        const filters: FindOptionsWhere<Kyc> = {
          requirement: { id: requirement.id },
          organization: { id: organization.id },
        };

        if (account) filters.account = { id: account.id };

        const exists = await this.filter(filters);

        if (exists) {
          await this.update(
            { id: exists.id },
            { value, account: exists.account, verified: false },
          );
        } else {
          await this.save({
            requirement,
            organization,
            value,
            account: account ? account : undefined,
          });
        }
      }),
    );
  }

  async addOrganizationRequirements(
    user: User,
    account: Account,
    organizationId: number,
    payload: object,
    files: Express.Multer.File[],
  ): Promise<MessageResDto> {
    const organization = await this.organizationService.filter(
      deepMerge(
        { id: organizationId },
        this.organizationService.organizationFilter(user, account),
      ),
    );

    if (!organization) {
      throw new BadRequestException('Organization not found');
    }

    const [validatedInputs, validatedFiles] = await Promise.all([
      this.validatedRequirements(payload, RequirementType.ORGANIZATION),
      this.validatedFiles(files, RequirementType.ORGANIZATION),
    ]);

    await Promise.all([
      this.processRequirementFiles(validatedFiles, organization),
      this.processRequirementsInputs(validatedInputs, organization),
    ]);

    return { message: 'Requirements configured successfully for review' };
  }

  async addMemberRequirement(
    account: Account,
    organizationId: number,
    payload: object,
    files: Express.Multer.File[],
  ): Promise<MessageResDto> {
    const organization = await this.organizationService.filter({
      id: organizationId,
    });
    if (!organization) throw new BadRequestException('Organization not found');

    const [validatedInputs, validatedFiles] = await Promise.all([
      this.validatedRequirements(
        payload,
        RequirementType.INDIVIDUAL,
        organization,
      ),
      this.validatedFiles(files, RequirementType.INDIVIDUAL, organization),
    ]);

    await Promise.all([
      this.processRequirementFiles(validatedFiles, organization, account),
      this.processRequirementsInputs(validatedInputs, organization, account),
    ]);

    return { message: 'Requirements configured successfully for review' };
  }

  @OnEvent('kyc.check.approval')
  async processApproval(payload: {
    organization: Organization;
  }): Promise<void> {
    const kycs = await this.filterMany({
      organization: { id: payload.organization.id },
    });

    if (kycs.length === 0) return;

    if (kycs.every((kyc) => kyc.verified)) {
      await this.organizationService.update(
        { id: payload.organization.id },
        { status: OrganizationStatus.APPROVED },
      );
    }
  }

  async approveKyc(
    kycId: number,
    payload: KycUpdateDto,
  ): Promise<MessageResDto> {
    const kyc = await this.filter(
      { id: kycId },
      { relations: { organization: true } },
    );
    if (!kyc) throw new BadRequestException('kyc not found');

    if (payload.status === OrganizationStatus.APPROVED) {
      await this.update(
        { id: kycId },
        {
          verified: true,
          comment: payload.comment ? payload.comment : kyc.comment,
          status: payload.status,
        },
      );
    } else {
      await this.update(
        { id: kycId },
        { verified: false, comment: payload.comment, status: payload.status },
      );
    }

    this.eventEmitter.emit('kyc.check.approval', {
      organization: kyc.organization,
    });

    return { message: 'Successfully updated kyc requirement' };
  }
}
