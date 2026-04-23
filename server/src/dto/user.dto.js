import Joi from 'joi';

export const updateProfileDto = Joi.object({
  username: Joi.string().alphanum().min(3).max(30),
  email: Joi.string().email(),
});

export const getUsersQueryDto = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
