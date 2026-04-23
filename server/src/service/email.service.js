import transporter from "../config/mail.js";
import env from "../config/env.js";

export class EmailService {
  async sendVerificationCode(email, code) {
    const mailOptions = {
      from: env.EMAIL_FROM,
      to: email,
      subject: "Verify your account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="text-align: center; color: #333;">Verify Your Account</h2>
          <p style="text-align: center; color: #555;">Use the code below to verify your email address.</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4f46e5; background: #eef2ff; padding: 12px 24px; border-radius: 6px;">${code}</span>
          </div>
          <p style="text-align: center; color: #888; font-size: 13px;">This code expires in 10 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  }
}