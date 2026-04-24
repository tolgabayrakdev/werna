import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
    PORT: Joi.number().default(5000),
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(5432),
    DB_NAME: Joi.string().required(),
    DB_USER: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    JWT_ACCESS_SECRET: Joi.string().required(),
    JWT_REFRESH_SECRET: Joi.string().required(),
    JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
    COOKIE_DOMAIN: Joi.string().allow('').default(''),
    COOKIE_SECURE: Joi.boolean().default(false),
    SMTP_HOST: Joi.string().required(),
    SMTP_PORT: Joi.number().default(587),
    SMTP_SECURE: Joi.boolean().default(false),
    SMTP_USER: Joi.string().required(),
    SMTP_PASS: Joi.string().required(),
    EMAIL_FROM: Joi.string().default('noreply@werna.com'),
}).unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

export default value;
