import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityService } from '../../shared/services/entity.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import {
  Transaction,
  TransactionPurpose,
  TransactionStatus,
} from '../entities/transaction.entity';
import { TransactionReqDto } from '../dtos/transaction.dto';
import { Account } from '../../onboarding/entities/account.entity';
import { MessageResDto } from '../../shared/dtos/shared.dto';
import { DataSource, FindOptionsWhere } from 'typeorm';
import { ReadingService } from '../../billing/services/reading.service';
import { deepMerge } from '../../shared/services/utility.service';
import { QueryRunner } from 'typeorm/query-runner/QueryRunner';
import { Reconciliation } from '../entities/reconciliation.entity';
import { ProviderService } from '../../settings/services/provider.service';
import { v4 as uuidv4 } from 'uuid';
import { ScripayService } from '../../scripay/scripay.service';
import { WalletService } from '../../billing/services/wallet.service';
import { Wallet } from '../../billing/entities/wallet.entity';

@Injectable()
export class TransactionService extends EntityService<Transaction> {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly readingService: ReadingService,
    private readonly dataSource: DataSource,
    private readonly providerService: ProviderService,
    private readonly scripayService: ScripayService,
    private readonly walletService: WalletService,
  ) {
    super();
    super.setRepository(this.transactionRepository);
  }

  transactionFilter(account: Account): FindOptionsWhere<Transaction> {
    if (account.isStaff) return {};
    return { organization: { id: account.organization.id } };
  }

  async getStationWallet(stationId: number): Promise<Wallet> {
    const wallet = await this.walletService.filter({
      station: { id: stationId },
    });

    if (!wallet)
      throw new BadRequestException('Wallet for this station not configured');

    return wallet;
  }

  async collectPayment(
    payload: TransactionReqDto,
    account: Account,
  ): Promise<MessageResDto> {
    const reading = await this.readingService.filter(
      deepMerge(
        { id: payload.readingId },
        this.readingService.readingFilter(account.user, account),
      ),
      { relations: { pricing: { organization: true, station: true } } },
    );
    if (!reading) throw new BadRequestException('Reading not found');

    const provider = await this.providerService.filter({
      id: payload.providerId,
    });
    if (!provider) throw new BadRequestException('Provider not found');

    const qr: QueryRunner = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const expectedAmount = this.readingService.expectedAmount(reading);

      await qr.manager.insert(Reconciliation, {
        organization: reading.pricing.organization,
        station: reading.pricing.station,
        reading: reading,
        expectedAmount: expectedAmount,
        actualAmount: payload.amount,
        deficitAmount:
          expectedAmount - payload.amount > 0
            ? expectedAmount - payload.amount
            : 0,
        date: new Date(),
        account: account,
      });

      const orderId = uuidv4();
      await qr.manager.insert(Transaction, {
        organization: reading.pricing.organization,
        accountNumber: payload.accountNumber,
        orderId: orderId,
        purpose: TransactionPurpose.Incoming,
        provider: provider,
        amount: payload.amount,
        station: reading.pricing.station,
        reading: reading,
        actionBy: account,
      });

      const result = await this.scripayService.initiateStk(
        payload.accountNumber,
        orderId,
        payload.amount,
        (await this.getStationWallet(reading.pricing.station.id)).number,
      );

      await qr.manager.update(
        Transaction,
        { orderId: orderId },
        { checkoutId: result.rrn, status: TransactionStatus.Processing },
      );

      await qr.commitTransaction();
    } catch (error) {
      await qr.rollbackTransaction();
      throw error;
    } finally {
      await qr.release();
    }

    return { message: 'Transaction initiated successfully.' };
  }
}
