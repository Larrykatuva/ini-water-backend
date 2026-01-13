import {
  TypeOrmModule,
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory,
} from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../modules/authentication/entities/user.entity';
import { Code } from '../modules/authentication/entities/code.entity';
import { AccountRole } from '../modules/authorization/entities/accountRole.entity';
import { Permission } from '../modules/authorization/entities/permission.entity';
import { Role } from '../modules/authorization/entities/role.entity';
import { RolePermission } from '../modules/authorization/entities/rolePermission.entity';
import { Account } from '../modules/onboarding/entities/account.entity';
import { Attendant } from '../modules/onboarding/entities/attendant.entity';
import { Invite } from '../modules/onboarding/entities/invite.entity';
import { Kyc } from '../modules/onboarding/entities/kyc.entity';
import { Organization } from '../modules/onboarding/entities/organization.entity';
import { Requirement } from '../modules/onboarding/entities/requirement.entity';
import { Staff } from '../modules/onboarding/entities/staff.entity';
import { Station } from '../modules/onboarding/entities/station.entity';

/**
 * DatabaseConfig class for configuring a read-only PostgreSQL database connection.
 * Implements TypeOrmOptionsFactory to provide dynamic configuration options
 * based on environment variables.
 */
@Injectable()
class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  /**
   * Creates and returns TypeORM configuration options for the PostgreSQL database.
   * @returns TypeOrmModuleOptions - Database connection options.
   */
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('DBL_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      username: this.configService.get<string>('DB_USER'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_NAME'),
      // type: 'sqlite',
      // database: 'database.sqlite',
      entities: [
        Code,
        User,
        AccountRole,
        Permission,
        Role,
        RolePermission,
        Account,
        Attendant,
        Invite,
        Kyc,
        Organization,
        Requirement,
        Staff,
        Station,
      ],
      synchronize: true,
    };
  }
}

export default TypeOrmModule.forRootAsync({
  imports: undefined,
  useClass: DatabaseConfig,
});
