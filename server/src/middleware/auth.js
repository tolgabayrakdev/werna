import { verifyAccessToken } from '../utils/token.js';
import { UnauthorizedError } from '../exceptions/index.js';

export const authenticate = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return next(new UnauthorizedError('Erişim token\'ı eksik'));
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch {
    return next(new UnauthorizedError('Geçersiz veya süresi dolmuş erişim token\'ı'));
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!roles.includes(req.user.role)) {
      return next(new UnauthorizedError('Bu işlem için yetkiniz yok'));
    }

    next();
  };
};
