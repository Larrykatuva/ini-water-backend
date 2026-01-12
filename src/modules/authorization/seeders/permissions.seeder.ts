import { DataSource } from 'typeorm';
import { Permission, PermissionSets } from '../entities/permission.entity';

/**
 * seedPermissions seeds permissions o the database on application startup
 * @param dataSource
 */
export const seedPermissions = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(Permission);

  for (const data of PermissionSets) {
    const exists = await repo.findOne({ where: { name: data.permission } });
    if (!exists) {
      await repo.save(<Permission>{
        name: data.permission,
        type: data.type,
      });
    }
  }

  console.log('Permissions seeded successfully.');
};
