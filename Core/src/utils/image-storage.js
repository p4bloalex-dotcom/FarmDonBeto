import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const uploadRoot = path.resolve('public/uploads/medicines');
const allowedTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif']
]);
const maxImageBytes = 5 * 1024 * 1024;

export const saveMedicineImage = async imageBase64 => {
  if (!imageBase64) return null;

  const match = String(imageBase64).match(/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/);
  if (!match) throw new Error('La imagen debe enviarse en formato base64 valido.');

  const [, mimeType, rawBase64] = match;
  const extension = allowedTypes.get(mimeType);
  if (!extension) throw new Error('Formato de imagen no permitido. Use JPG, PNG, WEBP o GIF.');

  const buffer = Buffer.from(rawBase64, 'base64');
  if (!buffer.length || buffer.length > maxImageBytes) throw new Error('La imagen no puede superar 5MB.');

  await fs.mkdir(uploadRoot, { recursive: true });
  const fileName = `${crypto.randomUUID()}.${extension}`;
  await fs.writeFile(path.join(uploadRoot, fileName), buffer);
  return `/uploads/medicines/${fileName}`;
};
