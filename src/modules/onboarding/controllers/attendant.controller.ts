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
import { AttendantService } from '../services/attendant.service';
import { Attendant } from '../entities/attendant.entity';
import { PaginatedResponsePipe } from '../../shared/pipes/paginated-response.pipe';
import { SearchFields } from '../../shared/pipes/search-fields.pipe';
import { OrderingFields } from '../../shared/pipes/ordering-fields.pipe';
import {
  AttendantReqDto,
  AttendantResDto,
  AttendantUpdateDto,
} from '../dtos/station.dto';
import type { DefaultPagination } from '../../shared/dtos/shared.dto';
import {
  RequestUser,
  RequestUserAccount,
} from '../../authentication/decorators/auth.decorator';
import { User } from '../../authentication/entities/user.entity';
import { Account } from '../entities/account.entity';
import { PaginationDecorator } from '../../shared/decorators/pagination.decorator';
import { MessageResDto } from '../../shared/dtos/shared.dto';
import { QueryDecorator } from '../../shared/decorators/query.decorator';
import { deepMerge } from '../../shared/services/utility.service';
import { OrderingDecorator } from '../../shared/decorators/ordering.decorator';
import { ResponsePipe } from '../../shared/pipes/response.pipe';
import { AllowedPermissions } from '../../authorization/decorators/permissions.decorator';
import { SetPermission } from '../../authorization/entities/permission.entity';

@ApiTags('Onboarding')
@Controller('onboarding')
@UseGuards(AuthGuard)
export class AttendantController {
  constructor(private readonly attendantService: AttendantService) {}

  @Get('attendants')
  @PaginatedResponsePipe(AttendantResDto, HttpStatus.OK)
  @SearchFields(Attendant.name, 'id', 'name', 'code', 'access', 'restricted')
  @OrderingFields(Attendant.name, 'id', 'createdAt')
  async getAttendants(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @PaginationDecorator() pagination: DefaultPagination,
    @QueryDecorator() query: object,
    @OrderingDecorator() ordering: object,
  ): Promise<[Attendant[], number]> {
    return await this.attendantService.paginatedFilter(
      pagination,
      deepMerge(query, this.attendantService.attendantFilter(user, account)),
      {
        order: ordering,
        relations: {
          organization: true,
          station: true,
          staff: { account: { user: true } },
        },
      },
    );
  }

  @Post('attendants')
  @ResponsePipe(MessageResDto, HttpStatus.OK)
  @AllowedPermissions(SetPermission.ManageAttendants)
  async addAttendant(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @Body() payload: AttendantReqDto,
  ): Promise<MessageResDto> {
    return await this.attendantService.addAttendant(payload, user, account);
  }

  @Get('attendant/:id')
  @ResponsePipe(AttendantResDto, HttpStatus.OK)
  async getAttendant(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @Param('id') id: number,
  ): Promise<Attendant> {
    const attendant = await this.attendantService.filter(
      deepMerge(
        { id: id },
        this.attendantService.attendantFilter(user, account),
      ),
      {
        relations: {
          organization: true,
          station: true,
          staff: { account: { user: true } },
        },
      },
    );

    if (!attendant) throw new BadRequestException('Attendant not found');

    return attendant;
  }

  @Get('attendant/:id')
  @ResponsePipe(MessageResDto, HttpStatus.OK)
  @AllowedPermissions(SetPermission.ManageAttendants)
  async updateAttendant(
    @RequestUser() user: User,
    @RequestUserAccount() account: Account,
    @Param('id') id: number,
    @Body() payload: AttendantUpdateDto,
  ): Promise<MessageResDto> {
    return await this.attendantService.updateAttendant(
      id,
      payload,
      user,
      account,
    );
  }
}
