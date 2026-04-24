import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).max(128).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const verifySchema = Joi.object({
  userId: Joi.string().uuid().required(),
  code: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required(),
});

export const resendVerificationSchema = Joi.object({
  userId: Joi.string().uuid(),
  email: Joi.string().email(),
}).or('userId', 'email');
