import { UserService } from '../service/user.service.js';

export class UserController {
  constructor() {
    this.userService = new UserService();
  }

  getProfile = async (req, res, next) => {
    try {
      const user = await this.userService.getProfile(req.user.id);
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };

  updateProfile = async (req, res, next) => {
    try {
      const user = await this.userService.updateProfile(req.user.id, req.body);
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };

  getAllUsers = async (req, res, next) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await this.userService.getAllUsers({
        page: Number(page),
        limit: Number(limit),
      });
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  deleteUser = async (req, res, next) => {
    try {
      await this.userService.deleteUser(req.params.id);
      res.status(200).json({ success: true, data: { message: 'User deleted' } });
    } catch (err) {
      next(err);
    }
  };
}
