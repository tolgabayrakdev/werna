import crypto from 'crypto';
import { FeedbackRepository } from '../repository/feedback.repository.js';
import { eventEmitter } from '../utils/events.js';
import { NotFoundError, ValidationError } from '../exceptions/index.js';

const FEEDBACK_CODE_EXPIRES = 10 * 60 * 1000;

export class FeedbackService {
  constructor() {
    this.feedbackRepo = new FeedbackRepository();
  }

  async createLink(businessId, { name }) {
    const slug = this._generateSlug();
    const link = await this.feedbackRepo.createLink({ businessId, name, slug });
    return { ...link, slug };
  }

  async getLinks(businessId) {
    return this.feedbackRepo.findLinksByBusinessId(businessId);
  }

  async getLinkInfo(slug) {
    const link = await this.feedbackRepo.findLinkBySlug(slug);
    if (!link) {
      throw new NotFoundError('Bağlantı bulunamadı');
    }
    if (!link.is_active) {
      throw new ValidationError('Bu geri bildirim bağlantısı artık aktif değil');
    }
    return { name: link.name, businessName: link.business_name, slug: link.slug };
  }

  async deleteLink(businessId, linkId) {
    const deleted = await this.feedbackRepo.deleteLinkById(linkId, businessId);
    if (!deleted) {
      throw new NotFoundError('Bağlantı bulunamadı');
    }
    return deleted;
  }

  async submitFeedback({ slug, customerEmail, type, message }) {
    const link = await this.feedbackRepo.findLinkBySlug(slug);
    if (!link) {
      throw new NotFoundError('Bağlantı bulunamadı');
    }
    if (!link.is_active) {
      throw new ValidationError('Bu geri bildirim bağlantısı artık aktif değil');
    }

    const feedback = await this.feedbackRepo.createFeedback({
      linkId: link.id,
      businessId: link.business_id,
      customerEmail,
      type,
      message,
    });

    const code = this._generateCode();
    const expiresAt = new Date(Date.now() + FEEDBACK_CODE_EXPIRES);
    await this.feedbackRepo.saveFeedbackVerificationCode({
      feedbackId: feedback.id,
      code,
      expiresAt,
    });

    eventEmitter.emit('send-feedback-verification', { email: customerEmail, code });

    return { feedbackId: feedback.id, message: 'Doğrulama kodu e-posta adresinize gönderildi' };
  }

  async verifyFeedback({ feedbackId, code }) {
    const feedback = await this.feedbackRepo.findFeedbackById(feedbackId);
    if (!feedback) {
      throw new NotFoundError('Geri bildirim bulunamadı');
    }

    if (feedback.is_verified) {
      throw new ValidationError('Bu geri bildirim zaten doğrulanmış');
    }

    const storedCode = await this.feedbackRepo.findFeedbackVerificationCode(feedbackId, code);
    if (!storedCode) {
      throw new ValidationError('Geçersiz veya süresi dolmuş doğrulama kodu');
    }

    await this.feedbackRepo.deleteFeedbackVerificationCodes(feedbackId);
    const verified = await this.feedbackRepo.verifyFeedback(feedbackId);

    return { message: 'Geri bildiriminiz başarıyla alındı, teşekkür ederiz!', feedback: verified };
  }

  async getFeedbacks(businessId, { type, page = 1, limit = 20 }) {
    const { rows, total } = await this.feedbackRepo.findFeedbacksByBusinessId(businessId, {
      type,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    return {
      data: rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async getAnalytics(businessId) {
    return this.feedbackRepo.getAnalytics(businessId);
  }

  _generateSlug() {
    return crypto.randomBytes(6).toString('hex');
  }

  _generateCode() {
    return crypto.randomInt(100000, 999999).toString();
  }
}
