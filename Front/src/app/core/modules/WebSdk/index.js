// src/app/core/modules/WebSdk/index.js
// Pequeño stub para asegurar que WebSdk exista en el navegador
(function (global) {
  // Si el agente HID ya expuso window.WebSdk, no hacemos nada
  if (typeof global.WebSdk !== 'undefined') return;

  // Creamos un objeto vacío para evitar ReferenceError
  // (el agente real reemplazará esto cuando esté activo)
  global.WebSdk = {};
})(typeof window !== 'undefined' ? window : globalThis);
