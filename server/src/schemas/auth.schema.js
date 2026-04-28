import Joi from 'joi';

const enMessages = {
  'string.base': '{{#label}} must be a string',
  'string.email': 'Please enter a valid email address',
  'string.min': '{{#label}} must be at least {{#limit}} characters',
  'string.max': '{{#label}} must be at most {{#limit}} characters',
  'string.length': '{{#label}} must be exactly {{#limit}} characters',
  'string.pattern.base': '{{#label}} must contain only digits',
  'any.required': '{{#label}} is required',
};

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().label('Business name'),
  email: Joi.string().email().required().label('Email'),
  password: Joi.string().min(6).max(128).required().label('Password'),
}).messages(enMessages);

export const loginSchema = Joi.object({
  email: Joi.string().email().required().label('Email'),
  password: Joi.string().required().label('Password'),
}).messages(enMessages);

export const verifySchema = Joi.object({
  email: Joi.string().email().required().label('Email'),
  code: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .label('Verification code'),
}).messages(enMessages);

export const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required().label('Email'),
}).messages(enMessages);

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().label('Email'),
}).messages(enMessages);

export const resetPasswordSchema = Joi.object({
  token: Joi.string().length(64).required().label('Token'),
  newPassword: Joi.string().min(8).max(128).required().label('New password'),
}).messages(enMessages);
