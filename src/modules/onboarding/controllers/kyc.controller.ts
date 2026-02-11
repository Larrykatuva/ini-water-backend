import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '../../authentication/guards/auth.guard';
import { KycService } from '../services/kyc.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ResponsePipe } from '../../shared/pipes/response.pipe';
import {
  type DefaultPagination,
  MessageResDto,
} from '../../shared/dtos/shared.dto';
import {
  RequestUser,
  RequestUserAccount,
} from '../../authentication/decorators/auth.decorator';
import { User } from '../../authentication/entities/user.entity';
import { Account } from '../entities/account.entity';
import { PaginatedResponsePipe } from '../../shared/pipes/paginated-response.pipe';
import { SearchFields } from '../../shared/pipes/search-fields.pipe';
import { OrderingFields } from '../../shared/pipes/ordering-fields.pipe';
import { PaginationDecorator } from '../../shared/decorators/pagination.decorator';
import { QueryDecorator } from '../../shared/decorators/query.decorator';
import { OrderingDecorator } from '../../shared/decorators/ordering.decorator';
import { deepMerge } from '../../shared/services/utility.service';
import { Kyc } from '../entities/kyc.entity';
import { KycResDto, KycStatusResDto, KycUpdateDto } from '../dtos/kyc.dto';
import { AllowedPermissions } from '../../authorization/decorators/permissions.decorator';
import { SetPermission } from '../../authorization/entities/permission.entity';
import { KycStatus } from '../entities/kycStatus.entity';
import { KycStatusService } from '../services/kycStatus.service';

@ApiTags('Onboarding')
@Controller('onboarding')
@UseGuards(AuthGuard)
export class KycController {
  constructor(
    private readonly kycService: KycService,
    private readonly kycStatusService: KycStatusService,
  ) {}

  @Post('kyc/:organizationId')
  @ResponsePipe(MessageResDto, HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'))
  @AllowedPermissions(SetPermission.UploadKyc)
  async uploadRequirements(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @Param('organizationId') organizationId: number,
    @Body() payload: object,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<MessageResDto> {
    return await this.kycService.addOrganizationRequirements(
      user,
      account,
      organizationId,
      payload,
      files,
    );
  }

  @Get('kycs')
  @PaginatedResponsePipe(KycResDto, HttpStatus.OK)
  @SearchFields(
    Kyc.name,
    'id',
    'requirement__id',
    'requirement__type',
    'organization__id',
  )
  @OrderingFields(Kyc.name, 'id', 'createdAt')
  async getOrganizations(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @PaginationDecorator() pagination: DefaultPagination,
    @QueryDecorator() query: object,
    @OrderingDecorator() ordering: object,
  ): Promise<[Kyc[], number]> {
    return await this.kycService.paginatedFilter(
      pagination,
      deepMerge(query, this.kycService.kycFilter(user, account)),
      { order: ordering, relations: { requirement: true, organization: true } },
    );
  }

  @Patch('kyc/:kycId')
  @ResponsePipe(MessageResDto, HttpStatus.OK)
  @AllowedPermissions(SetPermission.ApproveKyc)
  async updateKyc(
    @Param('kycId') kycId: number,
    @Body() payload: KycUpdateDto,
  ): Promise<MessageResDto> {
    return await this.kycService.approveKyc(kycId, payload);
  }

  @Post('kyc/:organizationId/members')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMemberKyc(
    @RequestUserAccount() account: Account,
    @Param('organizationId') organizationId: number,
    @Body() payload: object,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<MessageResDto> {
    return await this.kycService.addMemberRequirement(
      account,
      organizationId,
      payload,
      files,
    );
  }

  @Get('kyc/:organizationId/members')
  @PaginatedResponsePipe(KycResDto, HttpStatus.OK)
  @SearchFields(
    Kyc.name,
    'id',
    'requirement__id',
    'requirement__type',
    'account__id',
    'organization__id',
  )
  @OrderingFields(Kyc.name, 'id', 'createdAt')
  async getMemberKycs(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @PaginationDecorator() pagination: DefaultPagination,
    @QueryDecorator() query: object,
    @OrderingDecorator() ordering: object,
  ): Promise<[Kyc[], number]> {
    return await this.kycService.paginatedFilter(
      pagination,
      deepMerge(query, this.kycService.kycMemberFilter(user, account)),
      { order: ordering, relations: { requirement: true, organization: true } },
    );
  }

  @Get('kyc-status')
  @PaginatedResponsePipe(KycStatusResDto, HttpStatus.OK)
  @SearchFields(
    KycStatus.name,
    'id',
    'status',
    'type',
    'organization__id',
    'account__id',
  )
  @OrderingFields(KycStatus.name, 'id', 'createdAt')
  async getKycStatuses(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @PaginationDecorator() pagination: DefaultPagination,
    @QueryDecorator() query: object,
    @OrderingDecorator() ordering: object,
  ): Promise<[KycStatus[], number]> {
    return await this.kycStatusService.paginatedFilter(
      pagination,
      deepMerge(query, this.kycStatusService.kycStatusFilter(user, account)),
      { order: ordering, relations: { organization: true, account: true } },
    );
  }
}
