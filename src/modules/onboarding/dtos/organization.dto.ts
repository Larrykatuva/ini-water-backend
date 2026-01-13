import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import {
  OrganizationAccess,
  OrganizationStatus,
} from '../entities/organization.entity';
import { UserResDto } from '../../authentication/dtos/user.dtos';
import { CommonDto } from '../../shared/dtos/shared.dto';

export class OrganizationReqDto {
  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'Code is required' })
  code: string;

  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'County is required' })
  county: string;

  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'Sub-County is required' })
  subCounty: string;

  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'Area is required' })
  area: string;

  @ApiProperty({ enum: OrganizationAccess })
  @IsNotEmpty({ message: 'Access is required' })
  access: OrganizationAccess;

  @ApiProperty({ type: Boolean })
  @IsNotEmpty({ message: 'Access is required' })
  restricted: boolean;

  logo: string;
}

export class OrganizationResDto extends OrganizationReqDto {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ enum: OrganizationStatus })
  status: OrganizationStatus;

  @ApiProperty({ type: String })
  createdAt: Date;

  @ApiProperty({ type: String })
  updatedAt: Date;
}

export class AccountResDto extends CommonDto {
  @ApiProperty({ type: OrganizationResDto })
  organization: OrganizationResDto;

  @ApiProperty({ type: UserResDto })
  user: UserResDto;

  @ApiProperty({ type: Boolean })
  active: boolean;

  @ApiProperty({ type: Boolean })
  isStaff: boolean;
}
