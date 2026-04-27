import { query } from '../config/db.js';

export class AuthRepository {
  async findBusinessByEmail(email) {
    const result = await query(
      `SELECT id, name, email, password, is_active, is_verified
       FROM businesses
       WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  }

  async findBusinessById(id) {
    const result = await query(
      `SELECT id, name, email, is_active, is_verified
       FROM businesses
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async createBusiness({ name, email, password }) {
    const result = await query(
      `INSERT INTO businesses (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, is_active, is_verified, created_at`,
      [name, email, password]
    );
    return result.rows[0];
  }

  async verifyBusiness(businessId) {
    const result = await query(
      `UPDATE businesses
       SET is_verified = TRUE, is_active = TRUE, updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, email, is_active, is_verified`,
      [businessId]
    );
    return result.rows[0] || null;
  }

  async saveVerificationCode({ businessId, code, expiresAt }) {
    const result = await query(
      `INSERT INTO verification_codes (business_id, code, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [businessId, code, expiresAt]
    );
    return result.rows[0];
  }

  async findVerificationCode(businessId, code) {
    const result = await query(
      `SELECT id, business_id, code, expires_at
       FROM verification_codes
       WHERE business_id = $1 AND code = $2 AND expires_at > NOW()`,
      [businessId, code]
    );
    return result.rows[0] || null;
  }

  async deleteVerificationCodesByBusinessId(businessId) {
    await query(`DELETE FROM verification_codes WHERE business_id = $1`, [businessId]);
  }

  async saveRefreshToken({ businessId, token, expiresAt }) {
    const result = await query(
      `INSERT INTO refresh_tokens (business_id, token, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [businessId, token, expiresAt]
    );
    return result.rows[0];
  }

  async findRefreshToken(token) {
    const result = await query(
      `SELECT rt.id, rt.business_id, rt.expires_at, b.name, b.email, b.is_active, b.is_verified
       FROM refresh_tokens rt
       JOIN businesses b ON rt.business_id = b.id
       WHERE rt.token = $1`,
      [token]
    );
    return result.rows[0] || null;
  }

  async deleteRefreshToken(token) {
    await query(`DELETE FROM refresh_tokens WHERE token = $1`, [token]);
  }

  async deleteRefreshTokensByBusinessId(businessId) {
    await query(`DELETE FROM refresh_tokens WHERE business_id = $1`, [businessId]);
  }

  async savePasswordResetToken({ businessId, token, expiresAt }) {
    const result = await query(
      `INSERT INTO password_reset_tokens (business_id, token, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [businessId, token, expiresAt]
    );
    return result.rows[0];
  }

  async findPasswordResetToken(token) {
    const result = await query(
      `SELECT id, business_id, expires_at
       FROM password_reset_tokens
       WHERE token = $1 AND expires_at > NOW() AND used_at IS NULL`,
      [token]
    );
    return result.rows[0] || null;
  }

  async markPasswordResetTokenUsed(id) {
    await query(`UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1`, [id]);
  }

  async deletePasswordResetTokensByBusinessId(businessId) {
    await query(`DELETE FROM password_reset_tokens WHERE business_id = $1`, [businessId]);
  }
}
