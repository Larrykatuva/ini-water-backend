import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/authentication/guards/auth.guard';
import { RoleService } from '../services/role.service';
import { ResponsePipe } from '../../shared/pipes/response.pipe';
import { AllowedPermissions } from '../decorators/permissions.decorator';
import { SetPermission } from '../entities/permission.entity';
import {
  RequestUser,
  RequestUserAccount,
} from '../../authentication/decorators/auth.decorator';
import { RoleReqDto, RoleResDto, RoleUpdateDto } from '../dtos/roles.dto';
import { MessageResDto } from '../../shared/dtos/shared.dto';
import type { DefaultPagination } from '../../shared/dtos/shared.dto';
import { Account } from '../../onboarding/entities/account.entity';
import { Role } from '../entities/role.entity';
import { SearchFields } from '../../shared/pipes/search-fields.pipe';
import { PaginatedResponsePipe } from 'src/modules/shared/pipes/paginated-response.pipe';
import { OrderingFields } from '../../shared/pipes/ordering-fields.pipe';
import { PaginationDecorator } from '../../shared/decorators/pagination.decorator';
import { QueryDecorator } from '../../shared/decorators/query.decorator';
import { OrderingDecorator } from '../../shared/decorators/ordering.decorator';
import { deepMerge } from '../../shared/services/utility.service';
import { User } from '../../authentication/entities/user.entity';

@ApiTags('Authorization')
@UseGuards(AuthGuard)
@Controller('authorization')
export class RolesController {
  constructor(private roleService: RoleService) {}

  @Post('roles')
  @ResponsePipe(MessageResDto, HttpStatus.CREATED)
  @AllowedPermissions(SetPermission.CreateRoles)
  async createRole(@Body() payload: RoleReqDto): Promise<MessageResDto> {
    await this.roleService.addNewRole(payload);
    return <MessageResDto>{
      success: true,
      message: 'Role added successfully.',
    };
  }

  @Get('roles')
  @PaginatedResponsePipe(RoleResDto, HttpStatus.OK)
  @SearchFields(Role.name, 'id', 'organization__id', 'name', 'type')
  @OrderingFields(Role.name, 'id', 'createdAt')
  async getRoles(
    @PaginationDecorator() pagination: DefaultPagination,
    @QueryDecorator() query: object,
    @OrderingDecorator() ordering: object,
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
  ): Promise<[Role[], number]> {
    return await this.roleService.paginatedFilter(
      pagination,
      deepMerge(query, this.roleService.roleFilter(user, account)),
      ordering,
    );
  }

  @Get('role/:id')
  @ResponsePipe(RoleResDto, HttpStatus.OK)
  async getRole(@Param('id') id: number): Promise<Role> {
    const role = await this.roleService.filter({ id: id });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  @Patch('role/:id')
  @ResponsePipe(MessageResDto, HttpStatus.OK)
  @AllowedPermissions(SetPermission.UpdateRoles)
  async updateRole(
    @Param('id') id: number,
    @RequestUser() user: User,
    @Body() payload: RoleUpdateDto,
    @RequestUserAccount() account: Account,
  ): Promise<MessageResDto> {
    return await this.roleService.updateRole(id, payload, user, account);
  }
}
