import { Injectable } from '@nestjs/common';
import { EntityService } from '../../shared/services/entity.service';
import { AuthType, Permission } from '../entities/permission.entity';
import { Repository } from 'typeorm/repository/Repository';
import { User } from '../../authentication/entities/user.entity';
import { FindOptionsWhere } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PermissionsService extends EntityService<Permission> {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {
    super();
    super.setRepository(this.permissionRepository);
  }

  permissionsFilter(user: User): FindOptionsWhere<Permission> {
    if (user.isStaff) return {};
    return { type: AuthType.External };
  }
}
