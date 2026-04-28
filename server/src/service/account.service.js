import { BusinessRepository } from '../repository/business.repository.js';
import { BusinessProfileRepository } from '../repository/businessProfile.repository.js';
import { NotFoundError, ValidationError, ConflictError } from '../exceptions/index.js';
import { AuthRepository } from '../repository/auth.repository.js';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export class AccountService {
  constructor() {
    this.businessRepo = new BusinessRepository();
    this.businessProfileRepo = new BusinessProfileRepository();
    this.authRepo = new AuthRepository();
  }

  async getProfile(businessId) {
    const business = await this.businessRepo.findById(businessId);
    if (!business) {
      throw new NotFoundError('Business not found');
    }
    const profile = await this.businessProfileRepo.findByBusinessId(businessId);
    const { password: _, ...safe } = business;
    return {
      ...safe,
      onboardingCompleted: profile?.onboarding_completed ?? false,
    };
  }

  async getBusinessProfile(businessId) {
    const business = await this.businessRepo.findById(businessId);
    if (!business) {
      throw new NotFoundError('Business not found');
    }
    const profile = await this.businessProfileRepo.findByBusinessId(businessId);
    return {
      name: business.name,
      email: business.email,
      profile: profile
        ? {
            sector: profile.sector,
            description: profile.description,
            phone: profile.phone,
            website: profile.website,
            address: profile.address,
            city: profile.city,
            country: profile.country,
            openingHours: profile.opening_hours,
            logoUrl: profile.logo_url,
            socialLinks: profile.social_links,
            onboardingCompleted: profile.onboarding_completed,
          }
        : null,
    };
  }

  async upsertBusinessProfile(businessId, data) {
    const business = await this.businessRepo.findById(businessId);
    if (!business) {
      throw new NotFoundError('Business not found');
    }
    const profile = await this.businessProfileRepo.createOrUpdate(businessId, {
      sector: data.sector,
      description: data.description,
      phone: data.phone,
      website: data.website,
      address: data.address,
      city: data.city,
      country: data.country,
      opening_hours: data.openingHours,
      logo_url: data.logoUrl,
      social_links: data.socialLinks,
    });
    return {
      sector: profile.sector,
      description: profile.description,
      phone: profile.phone,
      website: profile.website,
      address: profile.address,
      city: profile.city,
      country: profile.country,
      openingHours: profile.opening_hours,
      logoUrl: profile.logo_url,
      socialLinks: profile.social_links,
      onboardingCompleted: profile.onboarding_completed,
    };
  }

  async completeOnboarding(businessId) {
    const business = await this.businessRepo.findById(businessId);
    if (!business) {
      throw new NotFoundError('Business not found');
    }
    const profile = await this.businessProfileRepo.createOrUpdate(businessId, {
      onboarding_completed: true,
    });
    return { onboardingCompleted: profile.onboarding_completed };
  }

  async updateProfile(businessId, data) {
    const business = await this.businessRepo.findById(businessId);
    if (!business) {
      throw new NotFoundError('Business not found');
    }

    if (data.email && data.email !== business.email) {
      const existing = await this.authRepo.findBusinessByEmail(data.email);
      if (existing) {
        throw new ConflictError('This email address is already in use');
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
      throw new NotFoundError('Business not found');
    }

    const isValid = await bcrypt.compare(currentPassword, business.password);
    if (!isValid) {
      throw new ValidationError('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    return this.businessRepo.updateById(businessId, { password: hashedPassword });
  }

  async deleteAccount(businessId) {
    const deleted = await this.businessRepo.deleteById(businessId);
    if (!deleted) {
      throw new NotFoundError('Business not found');
    }
    return deleted;
  }
}
