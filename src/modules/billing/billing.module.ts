import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule, SettingsModule, TypeOrmModule.forFeature([])],
  providers: [],
  controllers: [],
})
export class BillingModule {}
