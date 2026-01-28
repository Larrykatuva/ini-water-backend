import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import * as ejs from 'ejs';

const INVITE_SUBJECT = 'Account Invitation';
const APPROVAL_SUBJECT = 'Account Approval';

interface SendEmail {
  email: string;
  context: object;
  subject: string;
}

@Injectable()
export class EmailService {
  private logger: Logger;

  constructor(
    private nodeMailerService: MailerService,
    private configService: ConfigService,
  ) {
    this.logger = new Logger('EmailService');
  }

  @OnEvent('notify.email.code')
  async sendEmailCode(payload: SendEmail): Promise<void> {
    await this.sendEjsEmail({
      email: payload.email,
      context: payload.context,
      subject: payload.subject,
      template: 'code.ejs',
    });
  }

  @OnEvent('notify.email.approval')
  async sendApprovalEmail(payload: SendEmail): Promise<void> {
    await this.nodeMailerService.sendMail({
      from: this.configService.get<string>('DEFAULT_FROM_EMAIL'),
      to: payload.email,
      context: payload.context,
      subject: APPROVAL_SUBJECT,
      template: 'approval.ejs',
    });
  }

  async sendEjsEmail(payload: {
    email: string;
    subject: string;
    context: object;
    template: string;
    attachments?: any[];
    html?: string;
  }): Promise<void> {
    this.logger.log('Sending email email....');
    ejs.renderFile(
      `templates/${payload.template}`,
      payload.context,
      (err, html) => {
        if (err) throw err;
        payload.html = html;
      },
    );

    await this.nodeMailerService.sendMail({
      from: this.configService.get<string>('DEFAULT_FROM_EMAIL'),
      to: payload.email,
      subject: payload.subject,
      context: payload.context,
      html: payload.html,
      template: `templates/${payload.template}`,
      attachments: payload.attachments,
    });
    this.logger.log('Email sent successfully!');
  }

  @OnEvent('notify.email.invite')
  async sendInviteEmail(payload: {
    email: string;
    context: object;
    template: string;
  }): Promise<void> {
    await this.sendEjsEmail({
      email: payload.email,
      subject: INVITE_SUBJECT,
      context: payload.context,
      template: 'invite.ejs',
    });
  }

  @OnEvent('notify.account.verify')
  async sendVerifyAccountEmail(payload: SendEmail): Promise<void> {
    await this.sendEjsEmail({
      email: payload.email,
      subject: payload.subject,
      context: payload.context,
      template: 'auth/verifyAccount.ejs',
    });
  }

  @OnEvent('notify.account.reset')
  async sendAccountResetEmail(payload: SendEmail): Promise<void> {
    await this.sendEjsEmail({
      email: payload.email,
      subject: payload.subject,
      context: payload.context,
      template: 'auth/accountReset.ejs',
    });
  }

  @OnEvent('notify.account.login')
  async sendAccountLoginEmail(payload: SendEmail): Promise<void> {
    await this.sendEjsEmail({
      email: payload.email,
      subject: payload.subject,
      context: payload.context,
      template: 'auth/accountLogin.ejs',
    });
  }

  @OnEvent('notify.account.topup')
  async sendAccountTopupEmail(payload: SendEmail): Promise<void> {
    await this.sendEjsEmail({
      email: payload.email,
      subject: payload.subject,
      context: payload.context,
      template: 'topup.ejs',
    });
  }
}
