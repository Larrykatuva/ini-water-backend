import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import { ResponsePipe } from '../../shared/pipes/response.pipe';
import {
  type DefaultPagination,
  MessageResDto,
} from '../../shared/dtos/shared.dto';
import { TransactionReqDto, TransactionResDto } from '../dtos/transaction.dto';
import { RequestUserAccount } from '../../authentication/decorators/auth.decorator';
import { Account } from '../../onboarding/entities/account.entity';
import { PaginatedResponsePipe } from '../../shared/pipes/paginated-response.pipe';
import { Transaction } from '../entities/transaction.entity';
import { PaginationDecorator } from '../../shared/decorators/pagination.decorator';
import { QueryDecorator } from '../../shared/decorators/query.decorator';
import { OrderingDecorator } from '../../shared/decorators/ordering.decorator';
import { deepMerge } from '../../shared/services/utility.service';
import { SearchFields } from '../../shared/pipes/search-fields.pipe';
import { OrderingFields } from '../../shared/pipes/ordering-fields.pipe';
import { AuthGuard } from '../../authentication/guards/auth.guard';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('transactions')
  @ResponsePipe(MessageResDto, HttpStatus.OK)
  async initiateTransaction(
    @Body() payload: TransactionReqDto,
    @RequestUserAccount() account: Account,
  ): Promise<MessageResDto> {
    return await this.transactionService.collectPayment(payload, account);
  }

  @Get('transactions')
  @PaginatedResponsePipe(TransactionResDto, HttpStatus.OK)
  @SearchFields(
    Transaction.name,
    'id',
    'orderId',
    'providerRef',
    'accountNumber',
    'status',
    'purpose',
    'organization__id',
    'station__id',
    'reading__id',
    'actionBy__id',
  )
  @OrderingFields(Transaction.name, 'id', 'createdAt')
  async getTransactions(
    @RequestUserAccount() account: Account,
    @PaginationDecorator() pagination: DefaultPagination,
    @QueryDecorator() query: object,
    @OrderingDecorator() ordering: object,
  ): Promise<[Transaction[], number]> {
    return await this.transactionService.paginatedFilter(
      pagination,
      deepMerge(query, this.transactionService.transactionFilter(account)),
      { relations: { station: true }, order: ordering },
    );
  }
}
