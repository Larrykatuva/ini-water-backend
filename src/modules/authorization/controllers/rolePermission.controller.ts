import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RolePermissionService } from '../services/rolePermission.service';
import { AuthGuard } from '../../authentication/guards/auth.guard';
import { ResponsePipe } from '../../shared/pipes/response.pipe';
import { MessageResDto } from '../../shared/dtos/shared.dto';
import type { DefaultPagination } from '../../shared/dtos/shared.dto';
import {
  RolePermissionReqDto,
  RolePermissionResDto,
  RolePermissionUpdateDto,
} from '../dtos/rolePermission.dto';
import {
  RequestUser,
  RequestUserAccount,
} from '../../authentication/decorators/auth.decorator';
import { PaginatedResponsePipe } from '../../shared/pipes/paginated-response.pipe';
import { SearchFields } from '../../shared/pipes/search-fields.pipe';
import { OrderingFields } from '../../shared/pipes/ordering-fields.pipe';
import { PaginationDecorator } from '../../shared/decorators/pagination.decorator';
import { QueryDecorator } from '../../shared/decorators/query.decorator';
import { OrderingDecorator } from '../../shared/decorators/ordering.decorator';
import { RolePermission } from '../entities/rolePermission.entity';
import { User } from '../../authentication/entities/user.entity';
import { AllowedPermissions } from '../decorators/permissions.decorator';
import { SetPermission } from '../entities/permission.entity';
import { Account } from '../../onboarding/entities/account.entity';

@ApiTags('Authorization')
@UseGuards(AuthGuard)
@Controller('authorization')
export class RolePermissionsController {
  constructor(private rolePermissionService: RolePermissionService) {}

  @Post('role-permissions')
  @ResponsePipe(MessageResDto, HttpStatus.CREATED)
  @AllowedPermissions(SetPermission.ManageRolePermissions)
  async addRolePermission(
    @Body() payload: RolePermissionReqDto,
    @RequestUserAccount() account: Account,
    @RequestUserAccount() user: User,
  ): Promise<MessageResDto> {
    return await this.rolePermissionService.addPermission(
      payload,
      user,
      account,
    );
  }

  @Get('role-permissions')
  @PaginatedResponsePipe(RolePermissionResDto, HttpStatus.OK)
  @SearchFields(RolePermission.name, 'id', 'role__id', 'permission__id')
  @OrderingFields(RolePermission.name, 'id', 'createdAt')
  async getRolePermissions(
    @PaginationDecorator() pagination: DefaultPagination,
    @QueryDecorator() query: object,
    @OrderingDecorator() ordering: object,
  ): Promise<[RolePermission[], number]> {
    return await this.rolePermissionService.paginatedFilter(
      pagination,
      query,
      ordering,
    );
  }

  @Patch('role-permission/:id')
  @ResponsePipe(MessageResDto, HttpStatus.OK)
  @AllowedPermissions(SetPermission.ManageRolePermissions)
  async updateRolePermission(
    @Param('id') id: number,
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @Body() payload: RolePermissionUpdateDto,
  ): Promise<MessageResDto> {
    return await this.rolePermissionService.updatePermission(
      id,
      payload,
      user,
      account,
    );
  }
}
