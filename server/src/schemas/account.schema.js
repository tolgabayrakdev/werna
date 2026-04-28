import Joi from 'joi';

export const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required(),
}).messages({
  'any.required': '{{#label}} is required',
  'string.min': '{{#label}} must be at least {{#limit}} characters',
});

export const businessProfileSchema = Joi.object({
  sector: Joi.string().max(100).allow('').optional(),
  description: Joi.string().allow('').optional(),
  phone: Joi.string().max(50).allow('').optional(),
  website: Joi.string().max(255).allow('').optional(),
  address: Joi.string().allow('').optional(),
  city: Joi.string().max(100).allow('').optional(),
  country: Joi.string().max(100).allow('').optional(),
  openingHours: Joi.object().optional(),
  logoUrl: Joi.string().max(500).allow('').optional(),
  socialLinks: Joi.object().optional(),
}).messages({
  'string.max': '{{#label}} can be at most {{#limit}} characters',
});
