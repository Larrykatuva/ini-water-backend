import { DataSource } from 'typeorm';
import { seedPermissions } from './modules/authorization/seeders/permissions.seeder';
import { seedRoles } from './modules/authorization/seeders/roles.seeder';
import 'dotenv/config';
import * as dotenv from 'dotenv';
import { Role } from './modules/authorization/entities/role.entity';
import { RolePermission } from './modules/authorization/entities/rolePermission.entity';
import { Permission } from './modules/authorization/entities/permission.entity';
import { Organization } from './modules/onboarding/entities/organization.entity';
import { countrySeeder } from './modules/settings/seeders/country.seeder';
import { Provider } from './modules/settings/entities/provider.entity';
import { Country } from './modules/settings/entities/country.entity';
import { providersSeeder } from './modules/settings/seeders/providers.seeder';
import { requirementSeeder } from './modules/onboarding/seeders/requirements';
import { Requirement } from './modules/onboarding/entities/requirement.entity';

dotenv.config(); // Load .env

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DBL_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  entities: [
    Organization,
    Role,
    RolePermission,
    Permission,
    Country,
    Provider,
    Requirement,
  ],
});

AppDataSource.initialize()
  .then(async (dataSource: DataSource) => {
    await seedPermissions(dataSource);
    await seedRoles(dataSource);
    await countrySeeder(dataSource);
    await providersSeeder(dataSource);
    await requirementSeeder(dataSource);
    console.log('Seeding complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed', error);
    process.exit(1);
  });
