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

@Module({
  imports: [
    TypeOrmModule.forFeature([Pricing, Reading, Settlement]),
    SharedModule,
    SettingsModule,
    OnboardingModule,
    AuthenticationModule,
    AuthorizationModule,
  ],
  providers: [PricingService, ReadingService, SettlementService],
  controllers: [PricingController, ReadingController, SettlementController],
})
export class BillingModule {}
