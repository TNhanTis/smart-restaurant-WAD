import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private resend: Resend | null = null;
  private fromEmail: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('RESEND_API_KEY');

    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.fromEmail =
        this.configService.get('RESEND_FROM_EMAIL') || 'onboarding@resend.dev';
      console.log('✅ Resend email service initialized');
    } else {
      console.warn(
        '⚠️ RESEND_API_KEY not configured, email sending disabled',
      );
    }
  }

  async sendVerificationEmail(
    email: string,
    token: string,
    fullName?: string,
  ) {
    if (!this.resend) {
      console.warn('Email disabled, skipping verification email');
      return { success: false, skipped: true };
    }

    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;

    try {
      const { data, error } = await this.resend.emails.send({
        from: `Smart Restaurant <${this.fromEmail}>`,
        to: email,
        subject: 'Xác thực tài khoản - Smart Restaurant',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
              }
              .content {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .button {
                display: inline-block;
                padding: 12px 30px;
                background-color: #4CAF50;
                color: white !important;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
              }
              .footer {
                margin-top: 20px;
                text-align: center;
                color: #666;
                font-size: 12px;
              }
              h1 {
                color: #2c3e50;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="content">
                <h1>🎉 Chào mừng đến với Smart Restaurant!</h1>
                <p>Xin chào ${fullName || 'bạn'},</p>
                <p>Cảm ơn bạn đã đăng ký tài khoản tại Smart Restaurant. Để hoàn tất quá trình đăng ký, vui lòng xác thực địa chỉ email của bạn bằng cách nhấn vào nút bên dưới:</p>

                <div style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Xác thực email</a>
                </div>

                <p>Hoặc copy đường link sau vào trình duyệt:</p>
                <p style="word-break: break-all; color: #666; font-size: 14px;">${verificationUrl}</p>

                <p><strong>Lưu ý:</strong> Link xác thực này có hiệu lực trong vòng 24 giờ.</p>

                <p>Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.</p>

                <div class="footer">
                  <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                  <p>&copy; 2026 Smart Restaurant. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      if (error) {
        console.error('Resend error:', error);
        throw new Error(error.message);
      }

      console.log('✅ Verification email sent:', data?.id);
      return { success: true, id: data?.id };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(
    email: string,
    fullName: string,
    newPassword: string,
  ) {
    if (!this.resend) {
      console.warn('Email disabled, skipping password reset email');
      return { success: false, skipped: true };
    }

    const loginUrl = `${this.configService.get('FRONTEND_URL')}/login`;

    try {
      const { data, error } = await this.resend.emails.send({
        from: `Smart Restaurant <${this.fromEmail}>`,
        to: email,
        subject: 'Mật khẩu mới của bạn - Smart Restaurant',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
              }
              .content {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .password-box {
                background-color: #f0f0f0;
                padding: 15px;
                border-radius: 5px;
                text-align: center;
                font-size: 24px;
                font-weight: bold;
                letter-spacing: 2px;
                margin: 20px 0;
                color: #e74c3c;
              }
              .button {
                display: inline-block;
                padding: 12px 30px;
                background-color: #e74c3c;
                color: white !important;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
              }
              .footer {
                margin-top: 20px;
                text-align: center;
                color: #666;
                font-size: 12px;
              }
              h1 {
                color: #2c3e50;
              }
              .warning {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 10px;
                margin: 15px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="content">
                <h1>🔐 Mật khẩu mới của bạn</h1>
                <p>Xin chào ${fullName},</p>
                <p>Chúng tôi đã tạo mật khẩu mới cho tài khoản của bạn như bạn yêu cầu.</p>

                <p><strong>Mật khẩu mới của bạn là:</strong></p>
                <div class="password-box">${newPassword}</div>

                <div class="warning">
                  <strong>⚠️ Lưu ý bảo mật:</strong>
                  <ul style="margin: 5px 0;">
                    <li>Vui lòng đổi mật khẩu ngay sau khi đăng nhập</li>
                    <li>Không chia sẻ mật khẩu này với bất kỳ ai</li>
                    <li>Email này nên được xóa sau khi bạn đã lưu mật khẩu</li>
                  </ul>
                </div>

                <div style="text-align: center;">
                  <a href="${loginUrl}" class="button">Đăng nhập ngay</a>
                </div>

                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng liên hệ với chúng tôi ngay lập tức.</p>

                <div class="footer">
                  <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                  <p>&copy; 2026 Smart Restaurant. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      if (error) {
        console.error('Resend error:', error);
        throw new Error(error.message);
      }

      console.log('✅ Password reset email sent:', data?.id);
      return { success: true, id: data?.id };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}
