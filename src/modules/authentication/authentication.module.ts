import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Code } from './entities/code.entity';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { CodeService } from './services/code.service';
import { AuthController } from './controllers/auth.controller';
import { SharedModule } from '../shared/shared.module';
import { AuthGuard } from './guards/auth.guard';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Code]),
    SharedModule,
  ],
  providers: [UserService, AuthService, CodeService, AuthGuard, JwtService],
  controllers: [AuthController],
  exports: [AuthGuard, AuthService],
})
export class AuthenticationModule {}
