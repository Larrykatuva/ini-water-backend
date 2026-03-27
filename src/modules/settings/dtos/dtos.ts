import { CommonDto } from '../../shared/dtos/shared.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ProviderTypes } from '../entities/provider.entity';

export class CountryResDto extends CommonDto {
  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  code: string;

  @ApiProperty({ type: String })
  logo: string;
}

export class ProviderResDto extends CommonDto {
  @ApiProperty({ type: CountryResDto })
  country: CountryResDto;

  @ApiProperty({ enum: ProviderTypes })
  type: ProviderTypes;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  code: string;

  @ApiProperty({ type: String })
  logo: string;

  @ApiProperty({ type: String })
  swiftCode: string;

  @ApiProperty({ type: String })
  payBill: string;

  @ApiProperty({ type: String })
  address: string;

  @ApiProperty({ type: Boolean })
  active: boolean;
}
