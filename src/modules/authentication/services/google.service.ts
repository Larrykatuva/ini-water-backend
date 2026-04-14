import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { AuthCodeReqDto, AuthDevice } from '../dtos/auth.dtos';

@Injectable()
export class GoogleService {
  private client: OAuth2Client;
  private logger: Logger;

  constructor(private readonly configService: ConfigService) {
    this.client = new OAuth2Client({
      clientId: this.configService.get<string>('GOOGLE_AUTH_CLIENT_ID'),
      clientSecret: this.configService.get<string>('GOOGLE_AUTH_CLIENT_SECRET'),
      redirectUri: this.configService.get<string>('GOOGLE_AUTH_REDIRECT_URL'),
    });

    this.logger = new Logger('GoogleService');
  }

  getAuthUrl(device: AuthDevice): string {
    this.client = new OAuth2Client({
      clientId: this.configService.get<string>('GOOGLE_AUTH_CLIENT_ID'),
      clientSecret: this.configService.get<string>('GOOGLE_AUTH_CLIENT_SECRET'),
      redirectUri: this.configService.get<string>(
        `AUTH_REDIRECT_URL_${device.toString().toUpperCase()}`,
      ),
    });
    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    });
  }

  async getUserInfo(code: string, device: AuthDevice): Promise<TokenPayload> {
    try {
      const id_token = code;
      if (device === AuthDevice.Web) {
        const { tokens } = await this.client.getToken(code);
        this.client.setCredentials(tokens);
      }

      const ticket = await this.client.verifyIdToken({
        idToken: id_token,
        audience: this.configService.get<string>('GOOGLE_AUTH_CLIENT_ID'),
      });

      const payload = ticket.getPayload();

      if (!payload) throw new BadRequestException('Authentication failed');

      return payload;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Authentication failed');
    }
  }
}
