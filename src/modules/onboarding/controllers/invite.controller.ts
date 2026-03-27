import { ApiTags } from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../authentication/guards/auth.guard';
import { InviteService } from '../services/invite.service';
import { PaginatedResponsePipe } from '../../shared/pipes/paginated-response.pipe';
import { SearchFields } from '../../shared/pipes/search-fields.pipe';
import { Organization } from '../entities/organization.entity';
import { OrderingFields } from '../../shared/pipes/ordering-fields.pipe';
import { InviteReqDto, InviteResDto } from '../dtos/staff.dto';
import { Invite } from '../entities/invite.entity';
import { AllowedPermissions } from '../../authorization/decorators/permissions.decorator';
import { SetPermission } from '../../authorization/entities/permission.entity';
import {
  RequestUser,
  RequestUserAccount,
} from '../../authentication/decorators/auth.decorator';
import { User } from '../../authentication/entities/user.entity';
import { Account } from '../entities/account.entity';
import { PaginationDecorator } from '../../shared/decorators/pagination.decorator';
import {
  type DefaultPagination,
  MessageResDto,
} from '../../shared/dtos/shared.dto';
import { QueryDecorator } from '../../shared/decorators/query.decorator';
import { OrderingDecorator } from '../../shared/decorators/ordering.decorator';
import { deepMerge } from '../../shared/services/utility.service';
import { ResponsePipe } from '../../shared/pipes/response.pipe';

@ApiTags('Onboarding')
@Controller('onboarding')
@UseGuards(AuthGuard)
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @Get('invites')
  @PaginatedResponsePipe(InviteResDto, HttpStatus.OK)
  @SearchFields(
    Invite.name,
    'id',
    'name',
    'organization__id',
    'organization__code',
  )
  @OrderingFields(Organization.name, 'id', 'createdAt')
  async getInvites(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @PaginationDecorator() pagination: DefaultPagination,
    @QueryDecorator() query: object,
    @OrderingDecorator() ordering: object,
  ): Promise<[Invite[], number]> {
    return await this.inviteService.paginatedFilter(
      pagination,
      deepMerge(query, this.inviteService.inviteFilter(user, account)),
      {
        order: ordering,
        relations: { organization: true, actionBy: { user: true } },
      },
    );
  }

  @Post('invites')
  @ResponsePipe(MessageResDto, HttpStatus.OK)
  @AllowedPermissions(SetPermission.InviteUser)
  async inviteUser(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @Body() payload: InviteReqDto,
  ): Promise<MessageResDto> {
    return await this.inviteService.inviteUser(user, account, payload);
  }

  @Get('invite/:id')
  @ResponsePipe(InviteResDto, HttpStatus.OK)
  async getInvite(
    @Param('id') id: number,
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
  ): Promise<Invite> {
    const invite = await this.inviteService.filter(
      deepMerge({ id: id }, this.inviteService.inviteFilter(user, account)),
    );

    if (!invite) throw new BadRequestException('Invite not found');

    return invite;
  }
}
