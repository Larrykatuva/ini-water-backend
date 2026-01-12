import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { AuthenticationModule } from '../authentication/authentication.module';

@Module({
  imports: [SharedModule, AuthenticationModule],
  providers: [],
  exports: [],
})
export class AuthorizationModule {}
