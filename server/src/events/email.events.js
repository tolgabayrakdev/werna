import { eventEmitter } from '../utils/events.js';
import transporter from '../config/mail.js';
import env from '../config/env.js';

eventEmitter.on('send-verification-code', async ({ email, code }) => {
  const mailOptions = {
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Hesabınızı Doğrulayın',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="text-align: center; color: #333;">Hesap Doğrulama</h2>
        <p style="text-align: center; color: #555;">Hesabınızı doğrulamak için aşağıdaki kodu kullanın.</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4f46e5; background: #eef2ff; padding: 12px 24px; border-radius: 6px;">${code}</span>
        </div>
        <p style="text-align: center; color: #888; font-size: 13px;">Bu kod 10 dakika geçerlidir.</p>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Doğrulama kodu gönderilemedi:', err);
  }
});

eventEmitter.on('send-password-reset', async ({ email, token }) => {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
  const mailOptions = {
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Şifre Sıfırlama',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="text-align: center; color: #333;">Şifre Sıfırlama</h2>
        <p style="text-align: center; color: #555;">Şifrenizi sıfırlamak için aşağıdaki butona tıklayın.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #4f46e5; color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold;">Şifremi Sıfırla</a>
        </div>
        <p style="text-align: center; color: #888; font-size: 13px;">Bu bağlantı 1 saat geçerlidir. Eğer bu isteği siz yapmadıysanız görmezden gelebilirsiniz.</p>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Şifre sıfırlama e-postası gönderilemedi:', err);
  }
});

eventEmitter.on('send-feedback-verification', async ({ email, code }) => {
  const mailOptions = {
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Geri Bildirim Doğrulama',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="text-align: center; color: #333;">Geri Bildirim Doğrulama</h2>
        <p style="text-align: center; color: #555;">Geri bildiriminizi onaylamak için aşağıdaki kodu kullanın.</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4f46e5; background: #eef2ff; padding: 12px 24px; border-radius: 6px;">${code}</span>
        </div>
        <p style="text-align: center; color: #888; font-size: 13px;">Bu kod 10 dakika geçerlidir. Geri bildiriminiz doğrulandıktan sonra işletmeye iletilecektir.</p>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Geri bildirim doğrulama e-postası gönderilemedi:', err);
  }
});
