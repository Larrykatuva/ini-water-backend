import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '../../authentication/guards/auth.guard';
import { PaginatedResponsePipe } from '../../shared/pipes/paginated-response.pipe';
import {
  type DefaultPagination,
  MessageResDto,
} from '../../shared/dtos/shared.dto';
import { SearchFields } from '../../shared/pipes/search-fields.pipe';
import { OrderingFields } from '../../shared/pipes/ordering-fields.pipe';
import { Organization } from '../entities/organization.entity';
import { OrganizationService } from '../services/organization.service';
import {
  RequestUser,
  RequestUserAccount,
} from '../../authentication/decorators/auth.decorator';
import { User } from '../../authentication/entities/user.entity';
import { Account } from '../entities/account.entity';
import { PaginationDecorator } from '../../shared/decorators/pagination.decorator';
import { QueryDecorator } from '../../shared/decorators/query.decorator';
import { deepMerge } from '../../shared/services/utility.service';
import {
  OrganizationReqDto,
  OrganizationResDto,
} from '../dtos/organization.dto';
import { ResponsePipe } from '../../shared/pipes/response.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { AllowedPermissions } from '../../authorization/decorators/permissions.decorator';
import { SetPermission } from '../../authorization/entities/permission.entity';
import { OrderingDecorator } from '../../shared/decorators/ordering.decorator';

@ApiTags('Onboarding')
@Controller('onboarding')
@UseGuards(AuthGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('organizations')
  @PaginatedResponsePipe(OrganizationResDto, HttpStatus.OK)
  @SearchFields(Organization.name, 'id', 'name', 'code', 'access', 'restricted')
  @OrderingFields(Organization.name, 'id', 'createdAt')
  async getOrganizations(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @PaginationDecorator() pagination: DefaultPagination,
    @QueryDecorator() query: object,
    @OrderingDecorator() ordering: object,
  ): Promise<[Organization[], number]> {
    return await this.organizationService.paginatedFilter(
      pagination,
      deepMerge(
        query,
        this.organizationService.organizationFilter(user, account),
      ),
      { order: ordering },
    );
  }

  @Post('organizations')
  @UseInterceptors(FileInterceptor('logo'))
  @ResponsePipe(MessageResDto, HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  async registerOrganization(
    @RequestUser() user: User,
    @Body() payload: OrganizationReqDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MessageResDto> {
    return await this.organizationService.register(payload, user, file);
  }

  @Get('organization/:id')
  @ResponsePipe(OrganizationResDto, HttpStatus.OK)
  async getOrganization(
    @Param('id') id: number,
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
  ): Promise<Organization> {
    const organization = await this.organizationService.filter(
      deepMerge(
        { id: id },
        this.organizationService.organizationFilter(user, account),
      ),
    );

    if (!organization) throw new BadRequestException('Organization not found');

    return organization;
  }

  @Patch('organization/:id')
  @ResponsePipe(MessageResDto, HttpStatus.OK)
  @AllowedPermissions(SetPermission.ManageOrganization)
  async updateOrganization(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @Param('id') id: number,
    @Body() payload: OrganizationReqDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MessageResDto> {
    return await this.organizationService.updateOrganization(
      id,
      user,
      account,
      payload,
      file,
    );
  }
}
