import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../authentication/guards/auth.guard';
import { AccountService } from '../services/account.service';
import { PaginatedResponsePipe } from '../../shared/pipes/paginated-response.pipe';
import { AccountResDto } from '../dtos/organization.dto';
import { SearchFields } from '../../shared/pipes/search-fields.pipe';
import { OrderingFields } from '../../shared/pipes/ordering-fields.pipe';
import { Account } from '../entities/account.entity';
import {
  RequestUser,
  RequestUserAccount,
} from '../../authentication/decorators/auth.decorator';
import { User } from '../../authentication/entities/user.entity';
import { PaginationDecorator } from '../../shared/decorators/pagination.decorator';
import type { DefaultPagination } from '../../shared/dtos/shared.dto';
import { QueryDecorator } from '../../shared/decorators/query.decorator';
import { OrderingDecorator } from '../../shared/decorators/ordering.decorator';
import { deepMerge } from '../../shared/services/utility.service';
import { AllowedPermissions } from '../../authorization/decorators/permissions.decorator';
import { SetPermission } from '../../authorization/entities/permission.entity';
import { ResponsePipe } from '../../shared/pipes/response.pipe';

@ApiTags('Onboarding')
@Controller('onboarding')
@UseGuards(AuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('accounts')
  @PaginatedResponsePipe(AccountResDto, HttpStatus.OK)
  @SearchFields(
    Account.name,
    'id',
    'active',
    'status',
    'isStaff',
    'user__id',
    'organization__id',
    'organization__code',
    'user__email',
  )
  @OrderingFields(Account.name, 'id', 'createdAt')
  @AllowedPermissions(SetPermission.ManageAccount)
  async getAccounts(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @PaginationDecorator() pagination: DefaultPagination,
    @QueryDecorator() query: object,
    @OrderingDecorator() ordering: object,
  ): Promise<[Account[], number]> {
    return await this.accountService.paginatedFilter(
      pagination,
      deepMerge(query, this.accountService.accountsFilter(user, account)),
      { order: ordering, relations: { organization: true, user: true } },
    );
  }

  @Get('account/:id')
  @ResponsePipe(AccountResDto, HttpStatus.OK)
  @AllowedPermissions(SetPermission.ManageAccount)
  async getAccount(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @Param('id') id: number,
  ): Promise<Account> {
    const exists = await this.accountService.filter(
      deepMerge({ id: id }, this.accountService.accountsFilter(user, account)),
      { relations: { user: true, organization: true } },
    );

    if (!exists) throw new NotFoundException('Account not found');

    return exists;
  }
}
