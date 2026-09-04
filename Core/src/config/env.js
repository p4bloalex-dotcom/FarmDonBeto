import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().port().default(5246),
  API_PREFIX: Joi.string().default('/api'),
  ORACLE_USER: Joi.string().required(),
  ORACLE_PASSWORD: Joi.string().required(),
  ORACLE_CONNECT_STRING: Joi.string().required(),
  ORACLE_POOL_MIN: Joi.number().integer().min(0).default(1),
  ORACLE_POOL_MAX: Joi.number().integer().min(1).default(10),
  ORACLE_POOL_INCREMENT: Joi.number().integer().min(1).default(1),
  JWT_ISSUER: Joi.string().required(),
  JWT_AUDIENCE: Joi.string().required(),
  JWT_SIGNING_KEY: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  JWT_TEMP_EXPIRES_IN: Joi.string().default('2m'),
  CORS_ORIGINS: Joi.string().allow('').default(''),
  RATE_LIMIT_WINDOW_MS: Joi.number().integer().default(900000),
  RATE_LIMIT_MAX: Joi.number().integer().default(5000),
  LOGIN_RATE_LIMIT_MAX: Joi.number().integer().default(1000),
  DEFAULT_PAGE_SIZE: Joi.number().integer().min(1).default(10),
  MAX_PAGE_SIZE: Joi.number().integer().min(1).default(50),
  RUN_SEEDERS: Joi.boolean().truthy('true').falsy('false').default(false),
  LOG_LEVEL: Joi.string().default('info')
}).unknown(true);

const { value, error } = schema.validate(process.env, { abortEarly: false });

if (error) {
  throw new Error(`Invalid environment configuration: ${error.message}`);
}

export const env = {
  nodeEnv: value.NODE_ENV,
  port: value.PORT,
  apiPrefix: value.API_PREFIX,
  oracle: {
    user: value.ORACLE_USER,
    password: value.ORACLE_PASSWORD,
    connectString: value.ORACLE_CONNECT_STRING,
    poolMin: value.ORACLE_POOL_MIN,
    poolMax: value.ORACLE_POOL_MAX,
    poolIncrement: value.ORACLE_POOL_INCREMENT
  },
  jwt: {
    issuer: value.JWT_ISSUER,
    audience: value.JWT_AUDIENCE,
    signingKey: value.JWT_SIGNING_KEY,
    expiresIn: value.JWT_EXPIRES_IN,
    tempExpiresIn: value.JWT_TEMP_EXPIRES_IN
  },
  corsOrigins: value.CORS_ORIGINS ? value.CORS_ORIGINS.split(',').map(origin => origin.trim()) : true,
  rateLimit: {
    windowMs: value.RATE_LIMIT_WINDOW_MS,
    max: value.RATE_LIMIT_MAX,
    loginMax: value.LOGIN_RATE_LIMIT_MAX
  },
  pagination: {
    defaultPageSize: value.DEFAULT_PAGE_SIZE,
    maxPageSize: value.MAX_PAGE_SIZE
  },
  runSeeders: value.RUN_SEEDERS,
  logLevel: value.LOG_LEVEL
};
