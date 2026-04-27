import { query } from '../config/db.js';

export class BusinessRepository {
  async findById(id) {
    const result = await query(
      `SELECT id, name, email, password, is_active, is_verified, created_at, updated_at
       FROM businesses
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async updateById(id, data) {
    const fields = [];
    const values = [id];
    let i = 2;

    if (data.name !== undefined) {
      fields.push(`name = $${i++}`);
      values.push(data.name);
    }
    if (data.email !== undefined) {
      fields.push(`email = $${i++}`);
      values.push(data.email);
    }
    if (data.password !== undefined) {
      fields.push(`password = $${i++}`);
      values.push(data.password);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    const result = await query(
      `UPDATE businesses SET ${fields.join(', ')} WHERE id = $1 RETURNING id, name, email, is_active, updated_at`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteById(id) {
    const result = await query(`DELETE FROM businesses WHERE id = $1 RETURNING id`, [id]);
    return result.rows[0] || null;
  }
}
