import { Controller, Get, HttpStatus, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../authentication/guards/auth.guard';
import { Permission } from '../entities/permission.entity';
import { PermissionsService } from '../services/permissions.service';
import { RequestUser } from '../../authentication/decorators/auth.decorator';
import { User } from '../../authentication/entities/user.entity';
import { PaginatedResponsePipe } from '../../shared/pipes/paginated-response.pipe';
import { PermissionResDto } from '../dtos/permissions.dto';
import { SearchFields } from '../../shared/pipes/search-fields.pipe';
import { OrderingFields } from '../../shared/pipes/ordering-fields.pipe';
import { PaginationDecorator } from '../../shared/decorators/pagination.decorator';
import type { DefaultPagination } from '../../shared/dtos/shared.dto';
import { QueryDecorator } from '../../shared/decorators/query.decorator';
import { OrderingDecorator } from '../../shared/decorators/ordering.decorator';
import { deepMerge } from '../../shared/services/utility.service';
import { ResponsePipe } from '../../shared/pipes/response.pipe';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Authorization')
@Controller('authorization')
@UseGuards(AuthGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionsService) {}

  @Get('permissions')
  @PaginatedResponsePipe(PermissionResDto, HttpStatus.OK)
  @SearchFields(Permission.name, 'id', 'name', 'type', 'active')
  @OrderingFields(Permission.name, 'id', 'createdAt')
  async getPermissions(
    @PaginationDecorator() pagination: DefaultPagination,
    @QueryDecorator() query: object,
    @OrderingDecorator() ordering: object,
    @RequestUser() user: User,
  ): Promise<[Permission[], number]> {
    return await this.permissionService.paginatedFilter(
      pagination,
      deepMerge(query, this.permissionService.permissionsFilter(user)),
      { order: ordering },
    );
  }

  @Get('permission/:id')
  @ResponsePipe(PermissionResDto, HttpStatus.OK)
  async getPermission(
    @Param('id') id: number,
    @RequestUser() user: User,
  ): Promise<Permission> {
    const permission = await this.permissionService.filter({
      id: id,
      ...this.permissionService.permissionsFilter(user),
    });
    if (!permission) throw new NotFoundException('Permission not found');
    return permission;
  }
}
