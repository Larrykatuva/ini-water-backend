import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ResponsePipe } from '../../shared/pipes/response.pipe';
import { MessageResDto } from '../../shared/dtos/shared.dto';
import {
  LoginReqDto,
  LoginResDto,
  RegisterReqDto,
  RequestCodeReqDto,
  SwitchAccountDto,
  VerifyOtpReqDto,
} from '../dtos/auth.dtos';
import { RequestToken, RequestUser } from '../decorators/auth.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { Account } from '../../onboarding/entities/account.entity';
import { User } from '../entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ResponsePipe(MessageResDto, HttpStatus.CREATED)
  async register(@Body() payload: RegisterReqDto): Promise<MessageResDto> {
    return await this.authService.register(payload);
  }

  @Post('verify-otp')
  @ResponsePipe(MessageResDto, HttpStatus.OK)
  async verifyOtp(
    @Body() payload: VerifyOtpReqDto,
  ): Promise<MessageResDto | LoginResDto> {
    return await this.authService.verifyOtp(payload);
  }

  @Post('login')
  @ResponsePipe(LoginResDto, HttpStatus.OK)
  async login(
    @Body() payload: LoginReqDto,
  ): Promise<LoginResDto | MessageResDto> {
    return await this.authService.login(payload);
  }

  @Post('request-otp')
  @ResponsePipe(MessageResDto, HttpStatus.OK)
  async requestCode(
    @Body() payload: RequestCodeReqDto,
  ): Promise<MessageResDto> {
    return await this.authService.requestCode(payload);
  }

  @Get('accounts')
  @ResponsePipe([Account], HttpStatus.OK)
  async getUserAccounts(@RequestUser() user: User): Promise<Account[]> {
    return await this.authService.getUserAccounts(user);
  }

  @Post('switch-account')
  @ResponsePipe(LoginResDto, HttpStatus.OK)
  @UseGuards(AuthGuard)
  async switchAccount(
    @RequestToken() token: string,
    @Body() payload: SwitchAccountDto,
  ): Promise<MessageResDto | LoginResDto> {
    return await this.authService.switchAccount(token, payload.accountId);
  }
}
