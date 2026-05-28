import { Injectable, Logger } from '@nestjs/common';

interface EmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private logSkipped(action: string, to: string, subject: string): void {
    this.logger.warn(`Email skipped (${action}): to=${to}, subject="${subject}"`);
  }

  private async sendEmail({ to, subject }: EmailOptions): Promise<void> {
    this.logSkipped('send', to, subject);
  }

  async sendPasswordResetEmail(email: string, userId: number, token: string): Promise<void> {
    this.logger.warn(
      `Password reset requested for userId=${userId}. Email delivery is disabled; token was not sent.`,
    );
    this.logSkipped('password-reset', email, 'Reset your password');
    void token;
  }

  async sendRawHtml(email: string, subject: string, htmlContent: string): Promise<void> {
    void htmlContent;
    await this.sendEmail({ to: email, subject, htmlContent: '' });
  }
}
