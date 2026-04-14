import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { SharedModule } from '../shared/shared.module';
import { BillingModule } from '../billing/billing.module';
import { OnboardingModule } from '../onboarding/onboarding.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionService } from './services/transaction.service';
import { TransactionController } from './controllers/transaction.controller';
import { SettingsModule } from '../settings/settings.module';
import { ScripayModule } from '../scripay/scripay.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    SharedModule,
    AuthenticationModule,
    AuthorizationModule,
    BillingModule,
    OnboardingModule,
    SettingsModule,
    ScripayModule,
  ],
  providers: [TransactionService],
  controllers: [TransactionController],
})
export class PaymentModule {}
