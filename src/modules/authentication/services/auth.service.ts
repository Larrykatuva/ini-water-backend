import { UserService } from './user.service';
import { CodeService } from './code.service';
import {
  LoginReqDto,
  LoginResDto,
  RegisterReqDto,
  RequestCodeReqDto,
  VerifyOtpReqDto,
} from '../dtos/auth.dtos';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Purpose } from '../entities/code.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessageResDto } from '../../shared/dtos/shared.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AccountService } from '../../onboarding/services/account.service';
import { Account } from '../../onboarding/entities/account.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private codeService: CodeService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
    private accountService: AccountService,
  ) {}

  decryptPassword(user: User, password: string): boolean {
    return user && bcrypt.compareSync(password, user.password);
  }

  encryptPassword(password: string): string {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  async requestCode(payload: RequestCodeReqDto): Promise<MessageResDto> {
    // Validate user
    const user = await this.userService.filter({ email: payload.email });
    if (!user) throw new BadRequestException('Email not found');

    // Generate code as per the purpose
    const code = await this.codeService.generateOtp(user, payload.purpose);

    switch (payload.purpose) {
      case Purpose.EmailVerification:
      case Purpose.Registration: {
        this.eventEmitter.emit('notify.account.verify', {
          context: {
            code: code.code.slice(0, 3) + '-' + code.code.slice(3),
            username: user.fullName,
          },
          subject: 'Account Verification',
          email: user.email,
        });
        break;
      }
      case Purpose.ResetPassword: {
        this.eventEmitter.emit('notify.account.reset', {
          context: {
            code: code.code.slice(0, 3) + '-' + code.code.slice(3),
            username: user.fullName,
          },
          subject: 'Reset Password',
          email: user.email,
        });
        break;
      }
    }

    return { message: 'Code sent successfully! check your email' };
  }

  async register(payload: RegisterReqDto): Promise<MessageResDto> {
    if (
      await this.userService.filter({
        email: payload.email,
        emailVerified: true,
      })
    )
      throw new BadRequestException('Email is already taken');
    if (
      await this.userService.filter({
        phoneNumber: payload.phoneNumber,
        phoneVerified: true,
      })
    )
      throw new BadRequestException('Phone number is already taken');

    const user = await this.userService.save({
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      password: this.encryptPassword(payload.password),
      fullName: payload.fullName,
    });

    const code = await this.codeService.generateOtp(user, Purpose.Registration);

    this.eventEmitter.emit('notify.account.verify', {
      context: {
        code: code.code.slice(0, 3) + '-' + code.code.slice(3),
        username: user.fullName,
      },
      subject: 'Account Verification',
      email: user.email,
    });

    return { message: 'User registered successfully, code send to email' };
  }

  async verifyOtp(
    payload: VerifyOtpReqDto,
  ): Promise<MessageResDto | LoginResDto> {
    const user = await this.codeService.verifyOtp(payload.otp, payload.purpose);
    const userUpdate = new User();
    switch (payload.purpose) {
      case Purpose.Registration: {
        userUpdate.verified = true;
        userUpdate.emailVerified = true;
        break;
      }
      case Purpose.PhoneVerification: {
        userUpdate.phoneVerified = true;
        break;
      }
      case Purpose.EmailVerification: {
        userUpdate.emailVerified = true;
        break;
      }
      case Purpose.ResetPassword: {
        if (!payload.password)
          throw new BadRequestException('Password is required');
        userUpdate.password = this.encryptPassword(payload.password);
        break;
      }
      case Purpose.AccountLogin: {
        break;
      }
      default:
        throw new BadRequestException(
          'No implementation for this type of otp code',
        );
    }
    await this.userService.update({ id: user.id }, userUpdate);
    if (payload.purpose === Purpose.AccountLogin) {
      return this.generateUserToken(user);
    }
    return { message: 'Code verified successfully' };
  }

  generateUserToken(user: User, account?: Account): LoginResDto {
    return {
      accessToken: this.jwtService.sign(
        { ...user },
        {
          expiresIn: this.configService.get<string>('TOKEN_EXPIRY'),
          secret: this.configService.get<string>('PRIVATE_KEY'),
        },
      ),
      user: user,
      expiresIn: this.configService.get<string>('TOKEN_EXPIRY') as string,
      account: account,
    };
  }

  async login(payload: LoginReqDto): Promise<LoginResDto | MessageResDto> {
    const user = await this.userService.getUserByUsername(payload.username);
    if (!user) throw new BadRequestException('Invalid username or password');
    if (payload.username === user.phoneNumber && !user.phoneVerified)
      throw new BadRequestException('Phone number is not verified');
    if (payload.username === user.email && !user.emailVerified)
      throw new BadRequestException('Email is not verified');
    if (!this.decryptPassword(user, payload.password))
      throw new BadRequestException('Invalid login details');
    user.password = '';

    if (user.twoFactorEnabled) {
      // Generate code fo login
      const code = await this.codeService.generateOtp(
        user,
        Purpose.AccountLogin,
      );
      this.eventEmitter.emit('notify.account.login', {
        context: {
          code: code.code.slice(0, 3) + '-' + code.code.slice(3),
          username: user.fullName,
        },
        subject: 'Verifying your login',
        email: user.email,
      });

      return { message: 'One-time password has been send to your email.' };
    }

    let account: Account = new Account();
    const accounts = await this.accountService.filterMany(
      {
        user: { id: user.id },
        active: true,
      },
      { relations: { user: true, organization: true } },
    );
    if (accounts.length > 0) {
      account = accounts[0];
    }

    return this.generateUserToken(user, account);
  }

  async getUserAccounts(user: User): Promise<Account[]> {
    return await this.accountService.filterMany(
      {
        user: { id: user.id },
        active: true,
      },
      { relations: { user: true, organization: true } },
    );
  }

  async switchAccount(
    token: string,
    accountId: number,
  ): Promise<LoginResDto | MessageResDto> {
    const user = this.decodeToken(token);

    const account = await this.accountService.filter(
      {
        user: { id: user.id },
        id: accountId,
      },
      { relations: { user: true, organization: true } },
    );
    if (!account) throw new BadRequestException('Invalid account id');
    if (!account.active) throw new BadRequestException('Account deactivated');

    return this.generateUserToken(user, account);
  }

  decodeToken(token: string): User {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.PRIVATE_KEY,
      });
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
