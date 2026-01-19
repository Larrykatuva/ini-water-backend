import { forwardRef, Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { AuthenticationModule } from '../authentication/authentication.module';
import { AccountRoleService } from './services/accountRole.service';
import { RoleService } from './services/role.service';
import { PermissionsService } from './services/permissions.service';
import { RolePermissionService } from './services/rolePermission.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { RolePermission } from './entities/rolePermission.entity';
import { AccountRole } from './entities/accountRole.entity';
import { OnboardingModule } from '../onboarding/onboarding.module';
import { RolesController } from './controllers/roles.controller';
import { RolePermissionsController } from './controllers/rolePermission.controller';
import { AccountRoleController } from './controllers/accountRole.controller';
import { PermissionController } from './controllers/permission.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, Role, RolePermission, AccountRole]),
    SharedModule,
    forwardRef(() => AuthenticationModule),
    forwardRef(() => OnboardingModule),
  ],
  providers: [
    AccountRoleService,
    PermissionsService,
    RoleService,
    RolePermissionService,
  ],
  controllers: [
    PermissionController,
    RolesController,
    RolePermissionsController,
    AccountRoleController,
  ],
  exports: [],
})
export class AuthorizationModule {}
