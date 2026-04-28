import Joi from 'joi';

const enMessages = {
  'string.base': '{{#label}} must be a string',
  'string.email': 'Please enter a valid email address',
  'string.min': '{{#label}} must be at least {{#limit}} characters',
  'string.max': '{{#label}} must be at most {{#limit}} characters',
  'string.length': '{{#label}} must be exactly {{#limit}} characters',
  'string.pattern.base': '{{#label}} must contain only digits',
  'any.only': '{{#label}} contains an invalid value',
  'any.required': '{{#label}} is required',
};

export const createLinkSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().label('Link name'),
}).messages(enMessages);

export const submitFeedbackSchema = Joi.object({
  slug: Joi.string().required().label('Link'),
  customerEmail: Joi.string().email().required().label('Email'),
  type: Joi.string()
    .valid('complaint', 'suggestion', 'request', 'compliment')
    .required()
    .label('Feedback type'),
  message: Joi.string().min(10).max(2000).required().label('Message'),
}).messages(enMessages);

export const verifyFeedbackSchema = Joi.object({
  feedbackId: Joi.string().uuid().required().label('Feedback ID'),
  code: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .label('Verification code'),
}).messages(enMessages);
