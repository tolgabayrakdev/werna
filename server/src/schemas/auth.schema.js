import Joi from 'joi';

const trMessages = {
  'string.base': '{{#label}} metin olmalıdır',
  'string.email': 'Geçerli bir e-posta adresi giriniz',
  'string.min': '{{#label}} en az {{#limit}} karakter olmalıdır',
  'string.max': '{{#label}} en fazla {{#limit}} karakter olmalıdır',
  'string.length': '{{#label}} tam {{#limit}} karakter olmalıdır',
  'string.pattern.base': '{{#label}} yalnızca rakamlardan oluşmalıdır',
  'any.required': '{{#label}} zorunludur',
};

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().label('İşletme adı'),
  email: Joi.string().email().required().label('E-posta'),
  password: Joi.string().min(6).max(128).required().label('Şifre'),
}).messages(trMessages);

export const loginSchema = Joi.object({
  email: Joi.string().email().required().label('E-posta'),
  password: Joi.string().required().label('Şifre'),
}).messages(trMessages);

export const verifySchema = Joi.object({
  email: Joi.string().email().required().label('E-posta'),
  code: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .label('Doğrulama kodu'),
}).messages(trMessages);

export const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required().label('E-posta'),
}).messages(trMessages);

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().label('E-posta'),
}).messages(trMessages);

export const resetPasswordSchema = Joi.object({
  token: Joi.string().length(64).required().label('Token'),
  newPassword: Joi.string().min(8).max(128).required().label('Yeni şifre'),
}).messages(trMessages);
