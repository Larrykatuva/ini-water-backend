import { ApiTags } from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RequirementService } from '../services/requirement.service';
import { PaginatedResponsePipe } from '../../shared/pipes/paginated-response.pipe';
import { SearchFields } from '../../shared/pipes/search-fields.pipe';
import { OrderingFields } from '../../shared/pipes/ordering-fields.pipe';
import {
  RequirementReqDto,
  RequirementResDto,
  RequirementUpdateDto,
} from '../dtos/kyc.dto';
import { Requirement } from '../entities/requirement.entity';
import {
  RequestUser,
  RequestUserAccount,
} from '../../authentication/decorators/auth.decorator';
import { User } from '../../authentication/entities/user.entity';
import { Account } from '../entities/account.entity';
import { PaginationDecorator } from '../../shared/decorators/pagination.decorator';
import {
  type DefaultPagination,
  MessageResDto,
} from '../../shared/dtos/shared.dto';
import { QueryDecorator } from '../../shared/decorators/query.decorator';
import { OrderingDecorator } from '../../shared/decorators/ordering.decorator';
import { ResponsePipe } from '../../shared/pipes/response.pipe';
import { AuthGuard } from '../../authentication/guards/auth.guard';
import { AllowedPermissions } from '../../authorization/decorators/permissions.decorator';
import { SetPermission } from '../../authorization/entities/permission.entity';

@ApiTags('Onboarding')
@Controller('onboarding')
export class RequirementController {
  constructor(private readonly requirementService: RequirementService) {}

  @Get('requirements')
  @PaginatedResponsePipe(RequirementResDto, HttpStatus.OK)
  @SearchFields(
    Requirement.name,
    'id',
    'type',
    'name',
    'input',
    'required',
    'organization__id',
  )
  @OrderingFields(Requirement.name, 'id', 'createdAt')
  async getRequirements(
    @PaginationDecorator() pagination: DefaultPagination,
    @QueryDecorator() query: object,
    @OrderingDecorator() ordering: object,
  ): Promise<[Requirement[], number]> {
    return await this.requirementService.paginatedFilter(pagination, query, {
      relations: { organization: true },
      order: ordering,
    });
  }

  @Post('requirements')
  @ResponsePipe(MessageResDto, HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @AllowedPermissions(SetPermission.ManageRequirements)
  async addRequirement(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @Body() payload: RequirementReqDto,
  ): Promise<MessageResDto> {
    return await this.requirementService.addRequirement(user, account, payload);
  }

  @Get('requirement/:id')
  @ResponsePipe(RequirementResDto, HttpStatus.OK)
  async getRequirement(@Param('id') id: number): Promise<Requirement> {
    const requirement = await this.requirementService.filter(
      { id: id },
      { relations: { organization: true } },
    );

    if (!requirement) throw new BadRequestException(`Requirement not found`);

    return requirement;
  }

  @Patch('requirement/:id')
  @ResponsePipe(MessageResDto, HttpStatus.OK)
  @UseGuards(AuthGuard)
  @AllowedPermissions(SetPermission.ManageRequirements)
  async updateRequirement(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @Body() payload: RequirementUpdateDto,
    @Param('id') id: number,
  ): Promise<MessageResDto> {
    return await this.requirementService.updateRequirement(
      id,
      user,
      account,
      payload,
    );
  }
}
