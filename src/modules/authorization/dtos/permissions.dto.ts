import { CommonDto } from '../../shared/dtos/shared.dto';
import { ApiProperty } from '@nestjs/swagger';
import { AuthType, SetPermission } from '../entities/permission.entity';

export class PermissionResDto extends CommonDto {
  @ApiProperty({ enum: SetPermission })
  name: SetPermission;

  @ApiProperty({ enum: AuthType })
  type: AuthType;

  @ApiProperty({ type: Boolean })
  active: boolean;
}
