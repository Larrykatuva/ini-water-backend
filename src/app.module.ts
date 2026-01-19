import { Module } from '@nestjs/common';
import EnvConfig from './configs/env.config';
import EventsConfig from './configs/events.config';
import DatabaseConfig from './configs/database.config';
import RedisConfig from './configs/redis.config';
import MailConfig from './configs/mail.config';
import { SharedModule } from './modules/shared/shared.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { AuthorizationModule } from './modules/authorization/authorization.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { ScripayModule } from './modules/scripay/scripay.module';

@Module({
  imports: [
    EnvConfig,
    EventsConfig,
    DatabaseConfig,
    RedisConfig,
    MailConfig,
    ScheduleModule.forRoot(),
    SharedModule,
    NotificationsModule,
    ScripayModule,
    AuthenticationModule,
    AuthorizationModule,
    OnboardingModule,
  ],
})
export class AppModule {}
