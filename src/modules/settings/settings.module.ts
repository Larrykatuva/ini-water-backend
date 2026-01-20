import { SharedModule } from '../shared/shared.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './entities/country.entity';
import { Provider } from './entities/provider.entity';
import { Module } from '@nestjs/common';
import { CountryService } from './services/country.service';
import { ProviderService } from './services/provider.service';
import { CountryController } from './controllers/country.controller';
import { ProviderController } from './controllers/provider.controller';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([Country, Provider])],
  providers: [CountryService, ProviderService],
  controllers: [CountryController, ProviderController],
  exports: [ProviderService],
})
export class SettingsModule {}
