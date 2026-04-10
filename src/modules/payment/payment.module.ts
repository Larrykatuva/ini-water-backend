import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { SharedModule } from '../shared/shared.module';
import { BillingModule } from '../billing/billing.module';
import { OnboardingModule } from '../onboarding/onboarding.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    SharedModule,
    AuthenticationModule,
    AuthorizationModule,
    BillingModule,
    OnboardingModule,
  ],
  providers: [],
  controllers: [],
})
export class PaymentModule {}
