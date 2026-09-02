import crypto from 'node:crypto';

const saltSize = 16;
const keySize = 32;
const iterations = 10000;
const digest = 'sha256';
const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%&*()[]?/_-';

export const generateRandomPassword = (length = 10) => Array.from({ length }, () => chars[crypto.randomInt(chars.length)]).join('');

export const generateSalt = () => crypto.randomBytes(saltSize).toString('base64');

export const hashPassword = (password, salt) => crypto.pbkdf2Sync(password, Buffer.from(salt, 'base64'), iterations, keySize, digest).toString('base64');

export const createHashedPassword = plainPassword => {
  const salt = generateSalt();
  return { salt, password: hashPassword(plainPassword, salt) };
};

export const verifyPassword = (plainPassword, salt, storedHash) => {
  const inputHash = hashPassword(plainPassword, salt);
  return crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(storedHash));
};
