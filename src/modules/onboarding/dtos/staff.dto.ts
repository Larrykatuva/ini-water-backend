import { ApiProperty } from '@nestjs/swagger';
import { CommonDto } from '../../shared/dtos/shared.dto';
import { AccountResDto, OrganizationResDto } from './organization.dto';
import { InviteStatus } from '../entities/invite.entity';
import { IsNotEmpty } from 'class-validator';

export class InviteReqDto {
  @ApiProperty({ type: Number })
  @IsNotEmpty({ message: 'Organization id is required' })
  organizationId: number;

  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

export class InviteResDto extends CommonDto {
  @ApiProperty({ type: OrganizationResDto })
  organization: OrganizationResDto;

  @ApiProperty({ type: String })
  email: string;

  @ApiProperty({ type: AccountResDto })
  account: AccountResDto;

  @ApiProperty({ enum: InviteStatus })
  status: InviteStatus;
}

export class StaffReqDto {
  @ApiProperty({ type: Number })
  userId: number;

  @ApiProperty({ type: String })
  organizationId: number;

  @ApiProperty({ type: String })
  fullName: string;

  @ApiProperty({ type: String })
  title: string;

  profile: string;
}

export class StaffUpdateDto {
  @ApiProperty({ type: String })
  fullName: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: Boolean })
  active: boolean;

  profile: string;
}

export class StaffResDto extends CommonDto {
  @ApiProperty({ type: OrganizationResDto })
  organization: OrganizationResDto;

  @ApiProperty({ type: AccountResDto })
  account: AccountResDto;

  @ApiProperty({ type: InviteResDto })
  invite: InviteResDto;

  @ApiProperty({ type: String })
  fullName: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: Boolean })
  active: boolean;

  @ApiProperty({ type: String })
  profile: string;
}
