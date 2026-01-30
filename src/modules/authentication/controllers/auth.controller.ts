import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ResponsePipe } from '../../shared/pipes/response.pipe';
import { MessageResDto } from '../../shared/dtos/shared.dto';
import {
  AuthCodeReqDto,
  GoogleAuthResDto,
  LoginReqDto,
  LoginResDto, RefreshTokenReqDto,
  RegisterReqDto,
  RequestCodeReqDto,
  SwitchAccountDto,
  VerifyOtpReqDto,
} from '../dtos/auth.dtos';
import { RequestToken, RequestUser } from '../decorators/auth.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { Account } from '../../onboarding/entities/account.entity';
import { User } from '../entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { GoogleService } from '../services/google.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}

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

  @Post('profile')
  @ResponsePipe(MessageResDto, HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('profile'))
  @ApiConsumes('multipart/form-data')
  async uploadProfile(
    @RequestUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MessageResDto> {
    return await this.authService.uploadProfile(user, file);
  }

  @Get('google/auth-url')
  @ResponsePipe(GoogleAuthResDto, HttpStatus.OK)
  getGoogleAuthUrl(): GoogleAuthResDto {
    return { url: this.googleService.getAuthUrl() };
  }

  @Post('google/code')
  @ResponsePipe(LoginResDto, HttpStatus.OK)
  async processGoogleCode(@Body() payload: AuthCodeReqDto) {
    return await this.authService.googleAuth(payload.code);
  }

  @Post('refresh-token')
  @ResponsePipe(LoginResDto, HttpStatus.OK)
  async refreshToken(@Body() payload: RefreshTokenReqDto) {
    return await this.authService.refreshToken(payload.refreshToken);
  }
}
