import { query } from '../config/db.js';

export class BusinessProfileRepository {
  async findByBusinessId(businessId) {
    const result = await query(
      `SELECT id, business_id, sector, description, phone, website, address, city, country, opening_hours, logo_url, social_links, onboarding_completed, created_at, updated_at
       FROM business_profiles
       WHERE business_id = $1`,
      [businessId]
    );
    return result.rows[0] || null;
  }

  async createOrUpdate(businessId, data) {
    const existing = await this.findByBusinessId(businessId);

    if (existing) {
      const fields = [];
      const values = [businessId];
      let i = 2;

      if (data.sector !== undefined) { fields.push(`sector = $${i++}`); values.push(data.sector); }
      if (data.description !== undefined) { fields.push(`description = $${i++}`); values.push(data.description); }
      if (data.phone !== undefined) { fields.push(`phone = $${i++}`); values.push(data.phone); }
      if (data.website !== undefined) { fields.push(`website = $${i++}`); values.push(data.website); }
      if (data.address !== undefined) { fields.push(`address = $${i++}`); values.push(data.address); }
      if (data.city !== undefined) { fields.push(`city = $${i++}`); values.push(data.city); }
      if (data.country !== undefined) { fields.push(`country = $${i++}`); values.push(data.country); }
      if (data.opening_hours !== undefined) { fields.push(`opening_hours = $${i++}`); values.push(JSON.stringify(data.opening_hours)); }
      if (data.logo_url !== undefined) { fields.push(`logo_url = $${i++}`); values.push(data.logo_url); }
      if (data.social_links !== undefined) { fields.push(`social_links = $${i++}`); values.push(JSON.stringify(data.social_links)); }
      if (data.onboarding_completed !== undefined) { fields.push(`onboarding_completed = $${i++}`); values.push(data.onboarding_completed); }

      if (fields.length === 0) return existing;

      fields.push(`updated_at = NOW()`);
      const result = await query(
        `UPDATE business_profiles SET ${fields.join(', ')} WHERE business_id = $1 RETURNING *`,
        values
      );
      return result.rows[0];
    }

    const result = await query(
      `INSERT INTO business_profiles (business_id, sector, description, phone, website, address, city, country, opening_hours, logo_url, social_links, onboarding_completed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        businessId,
        data.sector ?? null,
        data.description ?? null,
        data.phone ?? null,
        data.website ?? null,
        data.address ?? null,
        data.city ?? null,
        data.country ?? null,
        data.opening_hours ? JSON.stringify(data.opening_hours) : null,
        data.logo_url ?? null,
        data.social_links ? JSON.stringify(data.social_links) : null,
        data.onboarding_completed ?? false,
      ]
    );
    return result.rows[0];
  }
}
