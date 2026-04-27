import Joi from 'joi';

const trMessages = {
  'string.base': '{{#label}} metin olmalıdır',
  'string.email': 'Geçerli bir e-posta adresi giriniz',
  'string.min': '{{#label}} en az {{#limit}} karakter olmalıdır',
  'string.max': '{{#label}} en fazla {{#limit}} karakter olmalıdır',
  'string.length': '{{#label}} tam {{#limit}} karakter olmalıdır',
  'string.pattern.base': '{{#label}} yalnızca rakamlardan oluşmalıdır',
  'any.only': '{{#label}} geçersiz bir değer içeriyor',
  'any.required': '{{#label}} zorunludur',
};

export const createLinkSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().label('Bağlantı adı'),
}).messages(trMessages);

export const submitFeedbackSchema = Joi.object({
  slug: Joi.string().required().label('Bağlantı'),
  customerEmail: Joi.string().email().required().label('E-posta'),
  type: Joi.string()
    .valid('complaint', 'suggestion', 'request', 'compliment')
    .required()
    .label('Geri bildirim türü'),
  message: Joi.string().min(10).max(2000).required().label('Mesaj'),
}).messages(trMessages);

export const verifyFeedbackSchema = Joi.object({
  feedbackId: Joi.string().uuid().required().label('Geri bildirim ID'),
  code: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .label('Doğrulama kodu'),
}).messages(trMessages);
