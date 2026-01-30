import { forwardRef, Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { AuthenticationModule } from '../authentication/authentication.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendant } from './entities/attendant.entity';
import { Invite } from './entities/invite.entity';
import { Kyc } from './entities/kyc.entity';
import { Organization } from './entities/organization.entity';
import { Requirement } from './entities/requirement.entity';
import { Staff } from './entities/staff.entity';
import { Station } from './entities/station.entity';
import { Account } from './entities/account.entity';
import { AccountService } from './services/account.service';
import { InviteService } from './services/invite.service';
import { OrganizationService } from './services/organization.service';
import { RequirementService } from './services/requirement.service';
import { StaffService } from './services/staff.service';
import { StationService } from './services/station.service';
import { AttendantService } from './services/attendant.service';
import { KycService } from './services/kyc.service';
import { AccountController } from './controllers/account.controller';
import { OrganizationController } from './controllers/organization.controller';
import { StaffController } from './controllers/staff.controller';
import { InviteController } from './controllers/invite.controller';
import { StationController } from './controllers/station.controller';
import { AttendantController } from './controllers/attendant.controller';
import { RequirementController } from './controllers/requirement.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      Attendant,
      Invite,
      Kyc,
      Organization,
      Requirement,
      Staff,
      Station,
    ]),
    SharedModule,
    AuthorizationModule,
    forwardRef(() => AuthenticationModule),
  ],
  providers: [
    OrganizationService,
    AccountService,
    InviteService,
    RequirementService,
    StaffService,
    StationService,
    AttendantService,
    KycService,
  ],
  controllers: [
    OrganizationController,
    InviteController,
    StaffController,
    RequirementController,
    AccountController,
    StationController,
    AttendantController,
  ],
  exports: [AccountService, OrganizationService, StationService],
})
export class OnboardingModule {}
