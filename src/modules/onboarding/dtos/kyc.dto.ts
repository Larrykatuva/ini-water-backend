import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import {
  RequirementInput,
  RequirementType,
} from '../entities/requirement.entity';
import { CommonDto } from '../../shared/dtos/shared.dto';
import { OrganizationResDto } from './organization.dto';

export class RequirementReqDto {
  @ApiProperty({ type: Number })
  @IsNotEmpty({ message: 'Organization is required' })
  organizationId: number;

  @ApiProperty({ enum: RequirementInput })
  @IsNotEmpty({ message: 'Input type is required' })
  input: RequirementInput;

  @ApiProperty({ type: Boolean })
  @IsNotEmpty({ message: 'Required is required' })
  required: boolean;

  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'name is required' })
  name: string;

  @ApiProperty({ type: String })
  comment: string;
}

export class RequirementUpdateDto {
  @ApiProperty({ type: Number })
  organizationId: number;

  @ApiProperty({ enum: RequirementInput })
  input: RequirementInput;

  @ApiProperty({ type: Boolean })
  required: boolean;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  comment: string;
}

export class RequirementResDto extends CommonDto {
  @ApiProperty({ type: Number })
  organizationId: number;

  @ApiProperty({ enum: RequirementInput })
  input: RequirementInput;

  @ApiProperty({ type: Boolean })
  required: boolean;

  @ApiProperty({ type: OrganizationResDto })
  organization: OrganizationResDto;

  @ApiProperty({ enum: RequirementType })
  type: RequirementType;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  comment: string;
}
