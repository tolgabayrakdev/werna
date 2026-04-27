import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { AuthRepository } from '../repository/auth.repository.js';
import { BusinessRepository } from '../repository/business.repository.js';
import { eventEmitter } from '../utils/events.js';
import { ConflictError, UnauthorizedError, ValidationError } from '../exceptions/index.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  parseDuration,
} from '../utils/token.js';
import env from '../config/env.js';

const SALT_ROUNDS = 12;
const VERIFICATION_CODE_EXPIRES = 10 * 60 * 1000;
const RESET_TOKEN_EXPIRES = 60 * 60 * 1000;

export class AuthService {
  constructor() {
    this.authRepo = new AuthRepository();
    this.businessRepo = new BusinessRepository();
  }

  async register({ name, email, password }) {
    const existing = await this.authRepo.findBusinessByEmail(email);
    if (existing) {
      throw new ConflictError('Bu e-posta adresi zaten kayıtlı');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const business = await this.authRepo.createBusiness({ name, email, password: hashedPassword });

    return { id: business.id, name: business.name, email: business.email };
  }

  async verify({ email, code }) {
    const business = await this.authRepo.findBusinessByEmail(email);
    if (!business) {
      throw new ValidationError('İşletme bulunamadı');
    }

    if (business.is_verified) {
      throw new ValidationError('Hesap zaten doğrulanmış');
    }

    const storedCode = await this.authRepo.findVerificationCode(business.id, code);
    if (!storedCode) {
      throw new ValidationError('Geçersiz veya süresi dolmuş doğrulama kodu');
    }

    await this.authRepo.deleteVerificationCodesByBusinessId(business.id);
    await this.authRepo.verifyBusiness(business.id);

    return { id: business.id, email: business.email, name: business.name, isVerified: true };
  }

  async resendVerificationByEmail(email) {
    const business = await this.authRepo.findBusinessByEmail(email);
    if (!business) {
      throw new ValidationError('Bu e-posta adresiyle kayıtlı hesap bulunamadı');
    }

    if (business.is_verified) {
      throw new ValidationError('Hesap zaten doğrulanmış');
    }

    await this.authRepo.deleteVerificationCodesByBusinessId(business.id);

    const code = this._generateCode();
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_EXPIRES);
    await this.authRepo.saveVerificationCode({ businessId: business.id, code, expiresAt });
    eventEmitter.emit('send-verification-code', { email: business.email, code });

    return { businessId: business.id, message: 'Doğrulama kodu yeniden gönderildi' };
  }

  async login({ email, password }) {
    const business = await this.authRepo.findBusinessByEmail(email);
    if (!business) {
      throw new UnauthorizedError('Geçersiz e-posta veya şifre');
    }

    const isPasswordValid = await bcrypt.compare(password, business.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Geçersiz e-posta veya şifre');
    }

    if (!business.is_verified) {
      await this.authRepo.deleteVerificationCodesByBusinessId(business.id);
      const code = this._generateCode();
      const expiresAt = new Date(Date.now() + VERIFICATION_CODE_EXPIRES);
      await this.authRepo.saveVerificationCode({ businessId: business.id, code, expiresAt });
      eventEmitter.emit('send-verification-code', { email: business.email, code });
      throw new UnauthorizedError('Lütfen önce e-postanızı doğrulayın');
    }

    if (!business.is_active) {
      throw new UnauthorizedError('Hesap devre dışı bırakılmış');
    }

    const tokenPayload = { id: business.id, email: business.email };
    const tokens = await this._generateTokens(tokenPayload, business.id);

    return {
      business: { id: business.id, name: business.name, email: business.email },
      tokens,
    };
  }

  async refreshToken(token) {
    if (!token) {
      throw new UnauthorizedError("Yenileme token'ı eksik");
    }

    const storedToken = await this.authRepo.findRefreshToken(token);
    if (!storedToken) {
      throw new UnauthorizedError("Geçersiz yenileme token'ı");
    }

    if (new Date(storedToken.expires_at) < new Date()) {
      await this.authRepo.deleteRefreshToken(token);
      throw new UnauthorizedError("Yenileme token'ının süresi dolmuş");
    }

    if (!storedToken.is_active) {
      await this.authRepo.deleteRefreshTokensByBusinessId(storedToken.business_id);
      throw new UnauthorizedError('Hesap devre dışı bırakılmış');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      await this.authRepo.deleteRefreshToken(token);
      throw new UnauthorizedError("Geçersiz yenileme token'ı");
    }

    await this.authRepo.deleteRefreshToken(token);

    const tokenPayload = { id: decoded.id, email: decoded.email };
    const tokens = await this._generateTokens(tokenPayload, storedToken.business_id);

    return { tokens };
  }

  async forgotPassword(email) {
    const business = await this.authRepo.findBusinessByEmail(email);
    if (!business || !business.is_verified) return;

    await this.authRepo.deletePasswordResetTokensByBusinessId(business.id);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRES);

    await this.authRepo.savePasswordResetToken({ businessId: business.id, token, expiresAt });
    eventEmitter.emit('send-password-reset', { email: business.email, token });
  }

  async resetPassword(token, newPassword) {
    const resetToken = await this.authRepo.findPasswordResetToken(token);
    if (!resetToken) {
      throw new ValidationError('Geçersiz veya süresi dolmuş sıfırlama bağlantısı');
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.businessRepo.updateById(resetToken.business_id, { password: hashedPassword });
    await this.authRepo.markPasswordResetTokenUsed(resetToken.id);
    await this.authRepo.deleteRefreshTokensByBusinessId(resetToken.business_id);
  }

  async logout(businessId, refreshToken) {
    if (refreshToken) {
      await this.authRepo.deleteRefreshToken(refreshToken);
    }
    if (businessId) {
      await this.authRepo.deleteRefreshTokensByBusinessId(businessId);
    }
  }

  _generateCode() {
    return crypto.randomInt(100000, 999999).toString();
  }

  async _generateTokens(payload, businessId) {
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const refreshExpiresAt = new Date(Date.now() + parseDuration(env.JWT_REFRESH_EXPIRES_IN));

    await this.authRepo.saveRefreshToken({
      businessId,
      token: refreshToken,
      expiresAt: refreshExpiresAt,
    });

    return { accessToken, refreshToken };
  }
}
