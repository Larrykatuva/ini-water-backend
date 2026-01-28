import { ApiTags } from '@nestjs/swagger';
import { SettlementService } from '../services/settlement.service';
import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { ResponsePipe } from '../../shared/pipes/response.pipe';
import { SettlementReqDto, SettlementResDto } from '../dtos/settlement.dtos';
import {
  type DefaultPagination,
  MessageResDto,
} from '../../shared/dtos/shared.dto';
import { AllowedPermissions } from '../../authorization/decorators/permissions.decorator';
import { SetPermission } from '../../authorization/entities/permission.entity';
import {
  RequestUser,
  RequestUserAccount,
} from '../../authentication/decorators/auth.decorator';
import { User } from '../../authentication/entities/user.entity';
import { Account } from '../../onboarding/entities/account.entity';
import { PaginatedResponsePipe } from '../../shared/pipes/paginated-response.pipe';
import { PaginationDecorator } from '../../shared/decorators/pagination.decorator';
import { QueryDecorator } from '../../shared/decorators/query.decorator';
import { OrderingDecorator } from '../../shared/decorators/ordering.decorator';
import { Settlement } from '../entities/settlement.entity';
import { deepMerge } from '../../shared/services/utility.service';

@ApiTags('Billing')
@Controller('billing')
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Post('settlements')
  @ResponsePipe(MessageResDto, HttpStatus.CREATED)
  @AllowedPermissions(SetPermission.ConfigureSettlement)
  async configureSettlement(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @Body() payload: SettlementReqDto,
  ): Promise<MessageResDto> {
    return await this.settlementService.configureSettlement(
      user,
      account,
      payload,
    );
  }

  @Get('settlements')
  @PaginatedResponsePipe(SettlementResDto, HttpStatus.OK)
  async getSettlements(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @PaginationDecorator() pagination: DefaultPagination,
    @QueryDecorator() query: object,
    @OrderingDecorator() ordering: object,
  ): Promise<[Settlement[], number]> {
    return await this.settlementService.paginatedFilter(
      pagination,
      deepMerge(query, this.settlementService.settlementFilter(user, account)),
      {
        order: ordering,
        relations: { organization: true, station: true, provider: true },
      },
    );
  }
}
