import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CommonDto } from '../../shared/dtos/shared.dto';
import { RoleResDto } from './roles.dto';
import { PermissionResDto } from './permissions.dto';

export class RolePermissionReqDto {
  @ApiProperty({ type: Number, required: true })
  @IsNotEmpty({ message: 'Role id is required' })
  roleId: number;

  @ApiProperty({ type: Number, required: true })
  @IsNotEmpty({ message: 'Permission id is required' })
  permissionId: number;
}

export class RolePermissionUpdateDto {
  @ApiProperty({ type: Number })
  roleId: number;

  @ApiProperty({ type: Number })
  permissionId: number;

  @ApiProperty({ type: Boolean })
  active: boolean;
}

export class RolePermissionResDto extends CommonDto {
  @ApiProperty({ type: RoleResDto })
  role: RoleResDto;

  @ApiProperty({ type: PermissionResDto })
  permission: PermissionResDto;

  @ApiProperty({ type: Boolean })
  active: boolean;
}
