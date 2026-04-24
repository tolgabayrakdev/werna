import Joi from 'joi';

export const registerDto = Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(128).required(),
});

export const loginDto = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const verifyDto = Joi.object({
    userId: Joi.string().uuid().required(),
    code: Joi.string()
        .length(6)
        .pattern(/^\d{6}$/)
        .required(),
});

export const resendVerificationDto = Joi.object({
    userId: Joi.string().uuid(),
    email: Joi.string().email(),
}).or('userId', 'email');
