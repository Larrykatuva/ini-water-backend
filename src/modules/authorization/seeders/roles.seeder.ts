import { DataSource } from 'typeorm';
import { AuthType, Permission } from '../entities/permission.entity';
import { Role, RoleSets } from '../entities/role.entity';
import { RolePermission } from '../entities/rolePermission.entity';

export const seedRoles = async (dataSource: DataSource) => {
  const permissionRepository = dataSource.getRepository(Permission);
  const roleRepository = dataSource.getRepository(Role);
  const rolePermissionRepository = dataSource.getRepository(RolePermission);
  let permissions = await permissionRepository.find({
    where: { active: true },
  });
  for (const role of RoleSets) {
    let newRole = await roleRepository.findOne({
      where: { name: role.name.toString() },
    });
    if (!newRole) {
      newRole = await roleRepository.save(role);
    }
    if (newRole.type == AuthType.External)
      permissions = await permissionRepository.find({
        where: { active: true, type: AuthType.External },
      });
    for (const permission of permissions) {
      if (
        !(await rolePermissionRepository.findOne({
          where: {
            permission: { id: permission.id },
            role: { id: newRole.id },
          },
        }))
      ) {
        await rolePermissionRepository.save(<RolePermission>{
          permission: permission,
          role: newRole,
        });
      }
    }
  }

  console.log('Roles seeded successfully');
};
