export const ok = (res, data = null, message = 'OK') => res.status(200).json({ success: true, message, data });
export const created = (res, data = null, message = 'Transaccion realizada correctamente.') => res.status(201).json({ success: true, message, data });
export const badRequest = (res, message = 'Solicitud invalida.', errors = null) => res.status(400).json({ success: false, message, errors });
export const unauthorized = (res, message = 'No autorizado.') => res.status(401).json({ success: false, message });
export const forbidden = (res, message = 'Acceso denegado.') => res.status(403).json({ success: false, message });
export const notFound = (res, message = 'Registro no encontrado.') => res.status(404).json({ success: false, message });
export const conflict = (res, message = 'El registro ya existe o esta relacionado.') => res.status(409).json({ success: false, message });
export const serverError = (res, message = 'Error interno del servidor.') => res.status(500).json({ success: false, message });
