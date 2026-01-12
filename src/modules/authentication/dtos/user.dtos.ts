import { ApiProperty } from '@nestjs/swagger';
import { CommonDto } from '../../shared/dtos/shared.dto';

export class UserResDto extends CommonDto {
  @ApiProperty({ type: String })
  email: string;

  @ApiProperty({ type: String })
  phoneNumber: string;

  @ApiProperty({ type: String })
  fullName: string;

  @ApiProperty({ type: String })
  profile: string;

  @ApiProperty({ type: Boolean })
  emailVerified: boolean;

  @ApiProperty({ type: Boolean })
  phoneVerified: boolean;

  @ApiProperty({ type: Boolean })
  active: boolean;
}
