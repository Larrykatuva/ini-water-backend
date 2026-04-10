import { ApiTags } from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from '../services/wallet.service';
import { PaginatedResponsePipe } from '../../shared/pipes/paginated-response.pipe';
import { WalletReqDto, WalletResDto } from '../dtos/wallet.dtos';
import { AuthGuard } from '../../authentication/guards/auth.guard';
import {
  RequestUser,
  RequestUserAccount,
} from '../../authentication/decorators/auth.decorator';
import { Account } from '../../onboarding/entities/account.entity';
import { PaginationDecorator } from '../../shared/decorators/pagination.decorator';
import type { DefaultPagination } from '../../shared/dtos/shared.dto';
import { MessageResDto } from '../../shared/dtos/shared.dto';
import { QueryDecorator } from '../../shared/decorators/query.decorator';
import { OrderingDecorator } from '../../shared/decorators/ordering.decorator';
import { deepMerge } from '../../shared/services/utility.service';
import { SearchFields } from '../../shared/pipes/search-fields.pipe';
import { OrderingFields } from '../../shared/pipes/ordering-fields.pipe';
import { Wallet } from '../entities/wallet.entity';
import { ResponsePipe } from '../../shared/pipes/response.pipe';
import { User } from '../../authentication/entities/user.entity';

@ApiTags('Billing')
@Controller('billing')
@UseGuards(AuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Post('wallets')
  @ResponsePipe(MessageResDto, HttpStatus.CREATED)
  async createWallet(
    @Body() payload: WalletReqDto,
    @RequestUserAccount() account: Account,
    @RequestUser() user: User,
  ): Promise<MessageResDto> {
    return await this.walletService.createWallet(payload, account, user);
  }

  @Get('wallets')
  @PaginatedResponsePipe(WalletResDto, HttpStatus.OK)
  @SearchFields(Wallet.name, 'id', 'organization__id', 'station__id', 'number')
  @OrderingFields(Wallet.name, 'id', 'createdAt')
  async getWallets(
    @RequestUserAccount() account: Account,
    @PaginationDecorator() pagination: DefaultPagination,
    @QueryDecorator() query: object,
    @OrderingDecorator() ordering: object,
  ): Promise<[Wallet[], number]> {
    return await this.walletService.paginatedFilter(
      pagination,
      deepMerge(query, this.walletService.walletFilter(account)),
      { relations: { organization: true, station: true }, order: ordering },
    );
  }

  @Get('wallet/:id')
  @ResponsePipe(WalletResDto, HttpStatus.OK)
  async getWallet(
    @Param('id') id: number,
    @RequestUserAccount() account: Account,
  ): Promise<Wallet> {
    const wallet = await this.walletService.filter(
      deepMerge({ id: id }, this.walletService.walletFilter(account)),
      { relations: { organization: true, station: true } },
    );

    if (!wallet) throw new BadRequestException('Wallet not found');

    return wallet;
  }
}
