import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CommonDto } from '../../shared/dtos/shared.dto';
import { AccountResDto, OrganizationResDto } from './organization.dto';
import { StaffResDto } from './staff.dto';

export class StationReqDto {
  @ApiProperty({ type: Number, required: true })
  @IsNotEmpty({ message: 'Organization is required' })
  organizationId: number;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty({ message: 'Code is required' })
  code: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'Location is required' })
  location: Record<string, string>;

  @ApiProperty({ type: String, required: true })
  description: string;

  profile: string;
}

export class StationUpdateDto {
  @ApiProperty({ type: Number })
  organizationId: number;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  code: string;

  @ApiProperty({ required: true })
  location: Record<string, string>;

  @ApiProperty({ type: String, required: true })
  status: boolean;

  @ApiProperty({ type: String })
  profile: string;

  @ApiProperty({ type: String })
  description: string;
}

export class StationResDto extends CommonDto {
  @ApiProperty({ type: OrganizationResDto })
  organization: OrganizationResDto;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  code: string;

  @ApiProperty({ required: true })
  location: Record<string, string>;

  @ApiProperty({ type: String, required: true })
  status: boolean;

  @ApiProperty({ type: String })
  profile: string;

  @ApiProperty({ type: String })
  description: string;
}

export class AttendantReqDto {
  @ApiProperty({ type: Number, required: true })
  @IsNotEmpty({ message: 'Account is required' })
  stationId: number;

  @ApiProperty({ type: Number, required: true })
  @IsNotEmpty({ message: 'Staff is required' })
  staffId: number;
}

export class AttendantUpdateDto {
  @ApiProperty({ type: Number })
  stationId: number;

  @ApiProperty({ type: Number })
  staffId: number;

  @ApiProperty({ type: Boolean })
  active: boolean;
}

export class AttendantResDto extends CommonDto {
  @ApiProperty({ type: StationResDto })
  station: StationResDto;

  @ApiProperty({ type: StationResDto })
  staff: StaffResDto;

  @ApiProperty({ type: AccountResDto })
  account: AccountResDto;

  @ApiProperty({ type: OrganizationResDto })
  organization: OrganizationResDto;

  @ApiProperty({ type: Boolean })
  active: boolean;
}
