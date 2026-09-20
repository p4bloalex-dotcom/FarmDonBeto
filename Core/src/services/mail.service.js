import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const isEnabled = () => Boolean(env.mail.host && env.mail.from);

const createTransporter = () => nodemailer.createTransport({
  host: env.mail.host,
  port: env.mail.port,
  secure: env.mail.secure,
  auth: env.mail.user ? { user: env.mail.user, pass: env.mail.password } : undefined
});

export const sendUserCredentialsEmail = async ({ to, userName, password, isReset = false }) => {
  if (!to || !isEnabled()) {
    logger.warn({ to, mailEnabled: isEnabled() }, 'Credential email was not sent because mail is not configured or recipient is missing.');
    return false;
  }

  const subject = isReset ? 'Credenciales restablecidas' : 'Credenciales de acceso';
  const intro = isReset ? 'Tu contrasena fue restablecida.' : 'Se creo tu usuario de acceso.';

  await createTransporter().sendMail({
    from: env.mail.from,
    to,
    subject,
    text: `${intro}\n\nUsuario: ${userName}\nContrasena: ${password}\n\nPor seguridad, cambia tu contrasena al iniciar sesion.`,
    html: `<p>${intro}</p><p><strong>Usuario:</strong> ${userName}<br><strong>Contrasena:</strong> ${password}</p><p>Por seguridad, cambia tu contrasena al iniciar sesion.</p>`
  });

  return true;
};
