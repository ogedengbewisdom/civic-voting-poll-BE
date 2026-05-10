import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transporter, createTransport } from 'nodemailer';
// import mailgunTransport from 'nodemailer-mailgun-transport';

@Injectable()
export class MailService {
  private transporter: Transporter;
  constructor(private config: ConfigService) {
    const auth = {
      host: 'smtp.mailgun.org',
      port: 587,
      secure: false,
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    };
    this.transporter = createTransport(auth);
  }

  async send_reset_password_link(
    email: string,
    token: string,
  ): Promise<boolean> {
    const reset_link = `${this.config.get('FE_BASE_URL')}/auth/reset-password/${token}`;

    const mail = {
      from: {
        address: `${this.config.get('SMTP_USER')}`,
        name: 'Civic Poll support',
      },
      to: email,
      subject: 'Reset Password Link',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1a1a1a;">Password Reset</h2>
        <p style="color: #444;">Click the button below to reset your password. This link expires in <strong>5 minutes</strong>.</p>
        <a href="${reset_link}" style="
          display: inline-block;
          padding: 12px 24px;
          background-color: #4F46E5;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          margin: 16px 0;
        ">Reset Password</a>
        <p style="color: #888; font-size: 13px;">If you did not request this, ignore this email.</p>
      </div>
    `,
    };

    try {
      await this.transporter.sendMail(mail);
      return true;
    } catch (error) {
      // console.log(error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error?.message || 'Failed to send reset password link',
      );
    }
  }
}
