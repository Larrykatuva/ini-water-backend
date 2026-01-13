import { forwardRef, Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { AuthenticationModule } from '../authentication/authentication.module';

@Module({
  imports: [SharedModule, forwardRef(() => AuthenticationModule)],
  providers: [],
  exports: [],
})
export class AuthorizationModule {}
