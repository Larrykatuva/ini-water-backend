import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../authentication/guards/auth.guard';
import { ResponsePipe } from '../../shared/pipes/response.pipe';
import { MessageResDto } from '../../shared/dtos/shared.dto';
import { AllowedPermissions } from '../decorators/permissions.decorator';
import { SetPermission } from '../entities/permission.entity';
import {
  RequestUser,
  RequestUserAccount,
} from '../../authentication/decorators/auth.decorator';
import { Account } from '../../onboarding/entities/account.entity';
import { RoleService } from '../services/role.service';
import { User } from '../../authentication/entities/user.entity';
import { AccountRoleReqDto } from '../dtos/accountRole.dto';

@ApiTags('Authorization')
@UseGuards(AuthGuard)
@Controller('authorization')
export class AccountRoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('account-roles')
  @ResponsePipe(MessageResDto, HttpStatus.CREATED)
  @AllowedPermissions(SetPermission.ManageRolePermissions)
  async assignRole(
    @Body() payload: AccountRoleReqDto,
    @RequestUserAccount() account: Account,
    @RequestUser() user: User,
  ): Promise<MessageResDto> {
    return await this.roleService.assignRole(payload, user, account);
  }
}
