import { UserRepository } from '../repository/user.repository.js';
import { NotFoundError } from '../exceptions/index.js';

export class UserService {
  constructor() {
    this.userRepo = new UserRepository();
  }

  async getProfile(userId) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async getAllUsers({ page, limit }) {
    return this.userRepo.findAll({ page, limit });
  }

  async updateProfile(userId, data) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return this.userRepo.updateById(userId, data);
  }

  async deleteUser(userId) {
    const deleted = await this.userRepo.deleteById(userId);
    if (!deleted) {
      throw new NotFoundError('User not found');
    }
    return deleted;
  }
}
