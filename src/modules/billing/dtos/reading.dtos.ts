import { CommonDto } from '../../shared/dtos/shared.dto';
import {
  AccountResDto,
  OrganizationResDto,
} from '../../onboarding/dtos/organization.dto';
import { ApiProperty } from '@nestjs/swagger';
import { PricingResDto } from './pricing.dtos';

export class ReadingResDto extends CommonDto {
  @ApiProperty({ type: OrganizationResDto })
  organization: OrganizationResDto;

  @ApiProperty({ type: PricingResDto })
  pricing: PricingResDto;

  @ApiProperty({ type: Number })
  volumeSold: number;

  @ApiProperty({ type: Date })
  date: Date;

  @ApiProperty({ type: AccountResDto })
  actionBy: AccountResDto;
}
