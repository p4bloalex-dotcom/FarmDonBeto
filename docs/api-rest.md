# 7. API REST

Endpoints principales del sistema basados en las rutas del backend. El prefijo configurado para la API es `/api`.

| Metodo | Ruta | Operacion |
|---|---|---|
| POST | `/api/auth/login` | Inicio de sesion |
| POST | `/api/catalog/sales` | Registro de venta presencial |
| POST | `/api/catalog/cash-sessions` | Apertura de sesion de caja |
| POST | `/api/catalog/cash-sessions/:id/close` | Cierre de sesion de caja |
| POST | `/api/catalog/purchases/orders` | Creacion de orden de compra |
| POST | `/api/catalog/purchases/orders/:id/approve` | Aprobacion de orden de compra |
| POST | `/api/catalog/purchases/receipts` | Recepcion de compra |
| POST | `/api/catalog/customer-orders` | Registro de pedido de cliente |
| PATCH | `/api/catalog/customer-orders/:id/status` | Cambio de estado de pedido: en ruta, entregado o cancelado |
| GET | `/api/catalog/inventory/availability` | Consulta de disponibilidad de inventario |
