import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import { ResponsePipe } from '../../shared/pipes/response.pipe';
import { StatusResDto } from '../../scripay/scripay.dto';

@ApiTags('Payments')
@Controller('callback')
export class CallbackController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('transaction')
  @ResponsePipe(undefined, HttpStatus.OK)
  async handleTransaction(@Body() payload: StatusResDto): Promise<void> {
    console.log(payload);
    await this.transactionService.processTransactionCallback(payload);
  }

  @Post('settlement')
  @ResponsePipe(undefined, HttpStatus.OK)
  async handleSettlement(@Body() payload: StatusResDto): Promise<void> {
    console.log(payload);
    await this.transactionService.processSettlementCallback(payload);
  }
}
