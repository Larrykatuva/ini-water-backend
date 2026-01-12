import { Injectable } from '@nestjs/common';
import {
  MailerModule,
  MailerOptions,
  MailerOptionsFactory,
} from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Injectable()
class MailConfig implements MailerOptionsFactory {
  constructor(private configService: ConfigService) {}

  createMailerOptions(): Promise<MailerOptions> | MailerOptions {
    return {
      transport: {
        host: this.configService.get<string>('EMAIL_HOST'),
        secure: false,
        auth: {
          user: this.configService.get<string>('EMAIL_HOST_USER'),
          pass: this.configService.get<string>('EMAIL_HOST_PASSWORD'),
        },
      },
      defaults: {
        from: `"No Reply" <${this.configService.get<string>(
          'DEFAULT_FROM_EMAIL',
        )}>`,
      },
      template: {
        dir: process.cwd() + '/templates/',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    };
  }
}

export default MailerModule.forRootAsync({
  useClass: MailConfig,
});
