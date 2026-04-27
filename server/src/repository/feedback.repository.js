import { query } from '../config/db.js';

export class FeedbackRepository {
  async createLink({ businessId, name, slug }) {
    const result = await query(
      `INSERT INTO feedback_links (business_id, name, slug)
       VALUES ($1, $2, $3)
       RETURNING id, business_id, name, slug, is_active, created_at`,
      [businessId, name, slug]
    );
    return result.rows[0];
  }

  async findLinksByBusinessId(businessId) {
    const result = await query(
      `SELECT id, name, slug, is_active, created_at
       FROM feedback_links
       WHERE business_id = $1
       ORDER BY created_at DESC`,
      [businessId]
    );
    return result.rows;
  }

  async findLinkBySlug(slug) {
    const result = await query(
      `SELECT fl.id, fl.business_id, fl.name, fl.slug, fl.is_active, b.name as business_name
       FROM feedback_links fl
       JOIN businesses b ON fl.business_id = b.id
       WHERE fl.slug = $1`,
      [slug]
    );
    return result.rows[0] || null;
  }

  async findLinkById(id, businessId) {
    const result = await query(
      `SELECT id, business_id, name, slug, is_active
       FROM feedback_links
       WHERE id = $1 AND business_id = $2`,
      [id, businessId]
    );
    return result.rows[0] || null;
  }

  async deleteLinkById(id, businessId) {
    const result = await query(
      `DELETE FROM feedback_links WHERE id = $1 AND business_id = $2 RETURNING id`,
      [id, businessId]
    );
    return result.rows[0] || null;
  }

  async createFeedback({ linkId, businessId, customerEmail, type, message }) {
    const result = await query(
      `INSERT INTO feedbacks (link_id, business_id, customer_email, type, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, link_id, business_id, customer_email, type, message, is_verified, created_at`,
      [linkId, businessId, customerEmail, type, message]
    );
    return result.rows[0];
  }

  async saveFeedbackVerificationCode({ feedbackId, code, expiresAt }) {
    const result = await query(
      `INSERT INTO feedback_verification_codes (feedback_id, code, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [feedbackId, code, expiresAt]
    );
    return result.rows[0];
  }

  async findFeedbackVerificationCode(feedbackId, code) {
    const result = await query(
      `SELECT id, feedback_id, code, expires_at
       FROM feedback_verification_codes
       WHERE feedback_id = $1 AND code = $2 AND expires_at > NOW()`,
      [feedbackId, code]
    );
    return result.rows[0] || null;
  }

  async deleteFeedbackVerificationCodes(feedbackId) {
    await query(`DELETE FROM feedback_verification_codes WHERE feedback_id = $1`, [feedbackId]);
  }

  async verifyFeedback(feedbackId) {
    const result = await query(
      `UPDATE feedbacks SET is_verified = TRUE WHERE id = $1
       RETURNING id, customer_email, type, message, is_verified, created_at`,
      [feedbackId]
    );
    return result.rows[0] || null;
  }

  async deleteFeedback(feedbackId) {
    await query(`DELETE FROM feedbacks WHERE id = $1`, [feedbackId]);
  }

  async findFeedbackById(feedbackId) {
    const result = await query(
      `SELECT id, link_id, business_id, customer_email, type, message, is_verified, created_at
       FROM feedbacks
       WHERE id = $1`,
      [feedbackId]
    );
    return result.rows[0] || null;
  }

  async findFeedbacksByBusinessId(businessId, { type, page, limit }) {
    const offset = (page - 1) * limit;
    const params = [businessId, limit, offset];
    let whereClause = `WHERE f.business_id = $1 AND f.is_verified = TRUE`;

    if (type) {
      params.splice(2, 0, type);
      whereClause += ` AND f.type = $3`;
      params[2] = type;
      const result = await query(
        `SELECT f.id, f.customer_email, f.type, f.message, f.created_at,
                fl.name as link_name, fl.slug as link_slug
         FROM feedbacks f
         JOIN feedback_links fl ON f.link_id = fl.id
         ${whereClause}
         ORDER BY f.created_at DESC
         LIMIT $4 OFFSET $5`,
        [businessId, type, limit, offset]
      );
      const countResult = await query(
        `SELECT COUNT(*) FROM feedbacks f ${whereClause}`,
        [businessId, type]
      );
      return { rows: result.rows, total: parseInt(countResult.rows[0].count) };
    }

    const result = await query(
      `SELECT f.id, f.customer_email, f.type, f.message, f.created_at,
              fl.name as link_name, fl.slug as link_slug
       FROM feedbacks f
       JOIN feedback_links fl ON f.link_id = fl.id
       ${whereClause}
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      params
    );
    const countResult = await query(
      `SELECT COUNT(*) FROM feedbacks f ${whereClause}`,
      [businessId]
    );
    return { rows: result.rows, total: parseInt(countResult.rows[0].count) };
  }

  async getAnalytics(businessId) {
    const byType = await query(
      `SELECT type, COUNT(*) as count
       FROM feedbacks
       WHERE business_id = $1 AND is_verified = TRUE
       GROUP BY type`,
      [businessId]
    );

    const thisWeek = await query(
      `SELECT type, COUNT(*) as count
       FROM feedbacks
       WHERE business_id = $1
         AND is_verified = TRUE
         AND created_at >= NOW() - INTERVAL '7 days'
       GROUP BY type`,
      [businessId]
    );

    const thisMonth = await query(
      `SELECT type, COUNT(*) as count
       FROM feedbacks
       WHERE business_id = $1
         AND is_verified = TRUE
         AND created_at >= DATE_TRUNC('month', NOW())
       GROUP BY type`,
      [businessId]
    );

    const thisYear = await query(
      `SELECT type, COUNT(*) as count
       FROM feedbacks
       WHERE business_id = $1
         AND is_verified = TRUE
         AND created_at >= DATE_TRUNC('year', NOW())
       GROUP BY type`,
      [businessId]
    );

    const monthly = await query(
      `SELECT TO_CHAR(created_at, 'YYYY-MM') as month, type, COUNT(*) as count
       FROM feedbacks
       WHERE business_id = $1
         AND is_verified = TRUE
         AND created_at >= NOW() - INTERVAL '12 months'
       GROUP BY month, type
       ORDER BY month ASC`,
      [businessId]
    );

    return {
      allTime: byType.rows,
      thisWeek: thisWeek.rows,
      thisMonth: thisMonth.rows,
      thisYear: thisYear.rows,
      monthly: monthly.rows,
    };
  }
}
