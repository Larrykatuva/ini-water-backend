import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../shared/shared.module';
import { Settlement } from './entities/settlement.entity';
import { Pricing } from './entities/pricing.entity';
import { Reading } from './entities/reading.entities';
import { PricingService } from './services/pricing.services';
import { ReadingService } from './services/reading.service';
import { SettlementService } from './services/settlement.service';
import { PricingController } from './controllers/pricing.controller';
import { ReadingController } from './controllers/reading.controller';
import { SettlementController } from './controllers/settlement.controller';
import { OnboardingModule } from '../onboarding/onboarding.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { AuthenticationModule } from '../authentication/authentication.module';
import { Wallet } from './entities/wallet.entity';
import { WalletController } from './controllers/wallet.controller';
import { WalletService } from './services/wallet.service';
import { ScripayModule } from '../scripay/scripay.module';
import { Reconciliation } from '../payment/entities/reconciliation.entity';
import { Transaction } from '../payment/entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Wallet,
      Pricing,
      Reading,
      Settlement,
      Reconciliation,
      Transaction,
    ]),
    SharedModule,
    SettingsModule,
    OnboardingModule,
    AuthenticationModule,
    AuthorizationModule,
    ScripayModule,
  ],
  providers: [PricingService, ReadingService, SettlementService, WalletService],
  controllers: [
    PricingController,
    ReadingController,
    SettlementController,
    WalletController,
  ],
  exports: [WalletService, ReadingService],
})
export class BillingModule {}
