import { query } from '../config/db.js';

export class UserRepository {
  async findById(id) {
    const result = await query(
      `SELECT u.id, u.email, u.username, u.is_active, u.created_at, u.updated_at, r.name as role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findAll({ page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const data = await query(
      `SELECT u.id, u.email, u.username, u.is_active, u.created_at, u.updated_at, r.name as role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const count = await query(`SELECT COUNT(*) FROM users`);
    return { users: data.rows, total: parseInt(count.rows[0].count, 10), page, limit };
  }

  async updateById(id, { username, email } = {}) {
    const fields = [];
    const values = [id];
    let paramIndex = 2;

    if (username !== undefined) {
      fields.push(`username = $${paramIndex++}`);
      values.push(username);
    }
    if (email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(email);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $1 RETURNING id, email, username, is_active, updated_at`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteById(id) {
    const result = await query(`DELETE FROM users WHERE id = $1 RETURNING id`, [id]);
    return result.rows[0] || null;
  }
}
