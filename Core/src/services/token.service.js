import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const createAccessToken = userId => jwt.sign(
  {},
  env.jwt.signingKey,
  {
    subject: String(userId),
    issuer: env.jwt.issuer,
    audience: env.jwt.audience,
    expiresIn: env.jwt.expiresIn,
    algorithm: 'HS512'
  }
);

export const createTemporaryToken = () => jwt.sign(
  { role: 'biometric' },
  env.jwt.signingKey,
  {
    issuer: env.jwt.issuer,
    audience: env.jwt.audience,
    expiresIn: env.jwt.tempExpiresIn,
    algorithm: 'HS512'
  }
);

export const verifyAccessToken = token => {
  try {
    return jwt.verify(token, env.jwt.signingKey, {
      issuer: env.jwt.issuer,
      audience: env.jwt.audience,
      algorithms: ['HS512']
    });
  } catch {
    return null;
  }
};
