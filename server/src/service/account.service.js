import { BusinessRepository } from '../repository/business.repository.js';
import { NotFoundError, ValidationError, ConflictError } from '../exceptions/index.js';
import { AuthRepository } from '../repository/auth.repository.js';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export class AccountService {
  constructor() {
    this.businessRepo = new BusinessRepository();
    this.authRepo = new AuthRepository();
  }

  async getProfile(businessId) {
    const business = await this.businessRepo.findById(businessId);
    if (!business) {
      throw new NotFoundError('İşletme bulunamadı');
    }
    const { password: _, ...safe } = business;
    return safe;
  }

  async updateProfile(businessId, data) {
    const business = await this.businessRepo.findById(businessId);
    if (!business) {
      throw new NotFoundError('İşletme bulunamadı');
    }

    if (data.email && data.email !== business.email) {
      const existing = await this.authRepo.findBusinessByEmail(data.email);
      if (existing) {
        throw new ConflictError('Bu e-posta adresi zaten kullanılıyor');
      }
    }

    const allowed = {};
    if (data.name) allowed.name = data.name;
    if (data.email) allowed.email = data.email;

    return this.businessRepo.updateById(businessId, allowed);
  }

  async updatePassword(businessId, { currentPassword, newPassword }) {
    const business = await this.businessRepo.findById(businessId);
    if (!business) {
      throw new NotFoundError('İşletme bulunamadı');
    }

    const isValid = await bcrypt.compare(currentPassword, business.password);
    if (!isValid) {
      throw new ValidationError('Mevcut şifre yanlış');
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    return this.businessRepo.updateById(businessId, { password: hashedPassword });
  }

  async deleteAccount(businessId) {
    const deleted = await this.businessRepo.deleteById(businessId);
    if (!deleted) {
      throw new NotFoundError('İşletme bulunamadı');
    }
    return deleted;
  }
}
