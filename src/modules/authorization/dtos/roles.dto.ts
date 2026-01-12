import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CommonDto } from '../../shared/dtos/shared.dto';
import { AuthType } from '../entities/permission.entity';

export class RoleReqDto {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty({ message: 'Role name is required' })
  name: string;
}

export class RoleUpdateDto {
  @ApiProperty({ type: String, required: false })
  name: string;

  @ApiProperty({ type: Boolean })
  active: boolean;
}

export class RoleResDto extends CommonDto {
  @ApiProperty({ enum: AuthType })
  type: AuthType;

  @ApiProperty({ type: String, required: false })
  name: string;

  @ApiProperty({ type: Boolean })
  active: boolean;
}
