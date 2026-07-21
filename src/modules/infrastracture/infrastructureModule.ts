import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module';
import { SharedModule } from '../shared/shared.module';
import { AuthenticationModule } from '../authentication/authentication.module';

@Module({
  imports: [AuthenticationModule, AuthorizationModule, SharedModule],
  providers: [],
  controllers: [],
})
export class InfrastructureModule {}
