import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
import {
  ChargeType,
  StatusResDto,
  TransactionResDto,
  TransStatus,
} from '../../scripay/scripay.dto';
import { SettlementService } from '../../billing/services/settlement.service';
import {
  Destination,
  Purpose,
  Settlement,
} from '../../billing/entities/settlement.entity';

@Injectable()
export class TransactionService extends EntityService<Transaction> {
  private logger: Logger;

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly readingService: ReadingService,
    private readonly dataSource: DataSource,
    private readonly providerService: ProviderService,
    private readonly scripayService: ScripayService,
    private readonly walletService: WalletService,
    private readonly settlementService: SettlementService,
  ) {
    super();
    super.setRepository(this.transactionRepository);

    this.logger = new Logger('TransactionService');
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

      await qr.manager.save(
        qr.manager.create(Reconciliation, {
          organization: reading.pricing.organization,
          station: reading.pricing.station,
          reading: reading,
          expectedAmount: expectedAmount,
          maxDecimalAmount: this.readingService.maximumDeficitAmount(reading),
          actualAmount: payload.amount,
          deficitAmount:
            expectedAmount - payload.amount > 0
              ? expectedAmount - payload.amount
              : 0,
          date: new Date(),
          account: account,
        }),
      );

      const orderId = uuidv4();
      const receiverAccount = await this.getStationWallet(
        reading.pricing.station.id,
      );

      await qr.manager.save(
        qr.manager.create(Transaction, {
          organization: reading.pricing.organization,
          accountNumber: payload.accountNumber,
          orderId: orderId,
          purpose: TransactionPurpose.Incoming,
          provider: provider,
          amount: payload.amount,
          station: reading.pricing.station,
          reading: reading,
          actionBy: account,
          receiverAccount: receiverAccount.number,
        }),
      );

      const result = await this.scripayService.initiateStk(
        payload.accountNumber,
        orderId,
        1,
        receiverAccount.number,
        '/callback/transaction',
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

  async initiateTransaction(
    transaction: Transaction,
    settlement: Settlement,
  ): Promise<void> {
    try {
      let result: TransactionResDto | null = null;

      if (settlement.destination === Destination.Wallet) {
        result = await this.scripayService.initiateTransfer(
          transaction.receiverAccount,
          settlement.accountNumber,
          settlement.amount.toString(),
          transaction.orderId,
        );
      } else {
        result = await this.scripayService.initiatePayout(
          transaction.accountNumber,
          transaction.orderId,
          transaction.amount.toFixed(2),
          settlement.destination === Destination.PhoneNumber
            ? settlement.accountNumber
            : '',
          settlement.accountNumber,
          settlement.reference,
        );
      }

      await this.update(
        { orderId: transaction.orderId },
        {
          status: TransactionStatus.Processing,
          checkoutId: result.rrn,
          fees: 0,
        },
      );
    } catch (error) {
      this.logger.error('Failed to initiate settlement transaction', error);
    }
  }

  async processCharges(
    settlementTransaction: Transaction,
    settlements: Settlement[],
  ): Promise<number> {
    this.logger.log('--------- CHECKING FOR CHARGE SETTLEMENT ---------');

    let charge: Settlement | null = null;
    for (const settlement of settlements) {
      if (settlement.purpose === Purpose.Charges) charge = settlement;
    }
    if (charge) {
      this.logger.log('------- PROCESSING CHARGE SETTLEMENT ---------');
      try {
        settlementTransaction.orderId = uuidv4();
        settlementTransaction.provider = charge.provider;
        settlementTransaction.receiverAccount = charge.accountNumber;
        settlementTransaction.amount = charge.amount;
        settlementTransaction.settlement = charge;

        await this.save(settlementTransaction);

        // Handle Charge transaction
        await this.initiateTransaction(settlementTransaction, charge);

        this.logger.log(
          '------- CHARGES SETTLEMENT INITIATED SUCCESSFULLY ---------',
        );

        return charge.amount;
      } catch (error) {
        this.logger.error('Failed to process charge transaction:', error);
        return 0;
      }
    }

    this.logger.log('--------- CHARGE SETTLEMENT NOT CONFIGURED---------');

    return 0;
  }

  async processSettlements(transaction: Transaction): Promise<void> {
    this.logger.log('--- PROCESSING SETTLEMENTS ----');
    const settlements = await this.settlementService.filterMany(
      {
        station: { id: transaction.station.id },
      },
      { relations: { provider: true } },
    );

    this.logger.log('--- FOUND SETTLEMENTS: ' + settlements.length + ' ----');

    if (settlements.length > 0) {
      const settlementTransaction = new Transaction();
      settlementTransaction.organization = transaction.organization;
      settlementTransaction.accountNumber = transaction.receiverAccount;
      settlementTransaction.purpose = TransactionPurpose.Settlement;
      settlementTransaction.station = transaction.station;
      settlementTransaction.reading = transaction.reading;
      settlementTransaction.actionBy = transaction.actionBy;

      let chargeAmount = await this.processCharges(
        { ...settlementTransaction } as Transaction,
        settlements,
      );

      if (chargeAmount > 0) {
        // Get charges for settlement
        const providerFee = await this.scripayService.getFeeCharges(
          chargeAmount.toString(),
          ChargeType.Wallet_Transfer,
        );
        chargeAmount = chargeAmount + providerFee.fee;
      }

      for (const settlement of settlements) {
        settlementTransaction.orderId = uuidv4();
        settlementTransaction.provider = settlement.provider;
        settlementTransaction.receiverAccount = settlement.accountNumber;
        settlementTransaction.settlement = settlement;

        let transactionAmount = transaction.amount - chargeAmount;

        if (transactionAmount > 0) {
          const settlementFee = await this.scripayService.getFeeCharges(
            chargeAmount.toString(),
            settlement.destination === Destination.Wallet
              ? ChargeType.Wallet_Transfer
              : settlement.destination === Destination.PhoneNumber
                ? ChargeType.B2C_Payout
                : ChargeType.B2B_payout,
          );

          transactionAmount = transactionAmount - settlementFee.fee;
        }

        switch (settlement.purpose) {
          case Purpose.General: {
            settlementTransaction.amount = transactionAmount;
            break;
          }
          case Purpose.Profits: {
            settlementTransaction.amount = 0;
            break;
          }
          case Purpose.Bill: {
            settlementTransaction.amount = 0;
            break;
          }
          default: {
            continue;
          }
        }

        await this.save(settlementTransaction);

        await this.initiateTransaction(settlementTransaction, settlement);
      }
    }
  }

  async handleCallback(payload: StatusResDto): Promise<Transaction | null> {
    const transaction = await this.filter(
      { checkoutId: payload.rrn },
      {
        relations: {
          station: true,
          reading: true,
        },
      },
    );

    if (!transaction) return null;

    this.logger.log('----- TRANSACTION FOUND BEING PROCESSED -----');

    if (transaction.status === TransactionStatus.Processing) {
      await this.update(
        { id: transaction.id },
        {
          status:
            payload.status === TransStatus.Success
              ? TransactionStatus.Success
              : TransactionStatus.Failed,
          narration: payload.narration,
          providerRef: payload.provider_ref,
          fees: payload.fee,
        },
      );

      this.logger.log('--- TRANSACTION STATUS UPDATED ----');

      return await this.filter(
        { checkoutId: payload.rrn },
        {
          relations: {
            station: true,
            reading: true,
            organization: true,
            actionBy: true,
          },
        },
      );
    }

    this.logger.error(
      '---- TRANSACTION FAILED IGNORED NOT IN PROCESSING STATE -----',
    );

    return null;
  }

  async processTransactionCallback(payload: StatusResDto): Promise<void> {
    this.logger.log('------- MAIN TRANSACTION CALLBACK RECEIVED -------');

    const transaction = await this.handleCallback(payload);

    if (transaction) {
      if (payload.status === TransStatus.Success) {
        await this.processSettlements(transaction);
      }
    }
  }

  async processSettlementCallback(payload: StatusResDto): Promise<void> {
    this.logger.log('------- SETTLEMENT CALlBACK RECEIVED -----');

    await this.handleCallback(payload);
  }
}
