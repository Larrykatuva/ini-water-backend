import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CommonDto } from '../../shared/dtos/shared.dto';
import { RoleResDto } from './roles.dto';
import { Account } from '../../onboarding/entities/account.entity';

export class AccountRoleReqDto {
  @ApiProperty({ type: Number, required: true })
  @IsNotEmpty({ message: 'Role is required' })
  roleId: number;

  @ApiProperty({ type: Number, required: true })
  @IsNotEmpty({ message: 'Staff id is required' })
  accountId: number;
}

export class AccountRoleUpdateDto {
  @ApiProperty({ type: Number })
  roleId: number;

  @ApiProperty({ type: Boolean })
  active: boolean;
}

export class AccountRoleResDto extends CommonDto {
  @ApiProperty({ type: RoleResDto })
  role: RoleResDto;

  @ApiProperty()
  account: Account;
}
