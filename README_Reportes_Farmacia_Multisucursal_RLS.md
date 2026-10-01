# Módulo de Reportes - Sistema de Farmacias Multisucursal

## 1. Objetivo

Este documento define la arquitectura técnica, reglas de acceso, seguridad, catálogo de reportes y lineamientos de implementación para el módulo de **Reportes** de un sistema de farmacias con múltiples sucursales.

El sistema opera bajo un esquema **multitenant / multisucursal**, donde la información que puede consultar cada usuario depende de su configuración de acceso.

---

# 2. Alcance funcional

El módulo de reportes debe permitir consultar información de:

- Ventas.
- Inventario.
- Compras.
- Proveedores.
- Caja.
- Flujo de efectivo.
- Traslados entre sucursales.
- Medicamentos vencidos.
- Medicamentos próximos a vencer.
- Medicamentos mas vendidos, menos vendidos
- Rotación de productos.
- Rentabilidad.
- Activos fijos.
- Planilla.
- Auditoría.
- Pedidos y entregas.
- Indicadores ejecutivos.

Los resultados deben respetar siempre el alcance de seguridad del usuario.


---





# 14. Filtros estándar de reportes

La mayoría de reportes debería utilizar:

```text
Fecha Inicio
Fecha Fin
Sucursal
Departamento
Producto
Categoría
Proveedor
Estado
Usuario
Forma de pago
```

El filtro sucursal debe comportarse según seguridad.

## Usuario GLOBAL

Puede seleccionar:

```text
Todas
Sucursal 1
Sucursal 2
Sucursal 3
...
```



# 15. Reporte de ventas por periodo


Parámetros:

```text
dateStart
dateEnd
branchId
productId
categoryId
paymentMethod
```


---

# 16. Reporte de ventas por sucursal

Disponible principalmente para usuarios GLOBAL o MULTI_BRANCH.

Campos:

```text
Sucursal
Número de ventas
Monto bruto
Descuentos
Monto neto
Costo
Utilidad
Ticket promedio
```

Ejemplo:

```text
Zona 10      Q850,000
Xela         Q620,000
Escuintla    Q510,000
Petén        Q290,000
```

---

# 17. Ventas por medicamento

Campos:

```text
Código
Medicamento
Categoría
Cantidad vendida
Precio promedio
Costo promedio
Venta total
Utilidad
```

Filtros:

```text
Sucursal
Periodo
Producto
Categoría
Laboratorio
```

---

# 18. Productos más vendidos

Debe permitir ordenar por:

```text
Cantidad
Monto vendido
Utilidad
```

Ejemplo:

```text
TOP 10
TOP 20
TOP 50
```

---

# 19. Productos menos vendidos

Objetivo:

Detectar inventario con baja rotación.

Campos:

```text
Medicamento
Existencia
Última venta
Días sin movimiento
Valor inventario
Fecha vencimiento
```

---

# 20. Inventario por sucursal

Campos:

```text
Sucursal
Código
Medicamento
Lote
Fecha vencimiento
Cantidad
Stock mínimo
Costo unitario
Valor inventario
```

---

# 21. Inventario consolidado

Solo disponible para usuarios autorizados.

Ejemplo:

```text
Producto        Zona10   Xela   Petén   Total

Ibuprofeno      100      80     25      205
Amoxicilina      50      32     15       97
```

---

# 22. Medicamentos próximos a vencer

Filtros:

```text
30 días
60 días
90 días
180 días
Personalizado
```

Campos:

```text
Sucursal
Medicamento
Lote
Fecha vencimiento
Días restantes
Cantidad
Costo
Valor total
```

---

# 23. Medicamentos vencidos

Campos:

```text
Sucursal
Producto
Lote
Fecha vencimiento
Cantidad
Costo
Valor perdido
```

Debe permitir conocer pérdidas.

Ejemplo:

```text
Sucursal Zona 10

Productos vencidos: 15
Unidades vencidas: 130

Pérdida estimada:
Q 8,350
```

---

# 24. Stock mínimo

Campos:

```text
Producto
Sucursal
Existencia
Stock mínimo
Faltante
Proveedor principal
```

Condición:

```text
quantity <= minimum_stock
```

---

# 25. Kardex

Debe mostrar toda modificación del inventario.

Campos:

```text
Fecha
Producto
Sucursal
Lote
Tipo movimiento
Documento
Entrada
Salida
Existencia
Usuario
```

Tipos:

```text
PURCHASE
SALE
TRANSFER_IN
TRANSFER_OUT
RETURN
ADJUSTMENT
EXPIRED
DAMAGED
```

---

# 26. Traslados entre sucursales

Campos:

```text
Código traslado
Origen
Destino
Fecha solicitud
Fecha aprobación
Fecha despacho
Fecha recepción
Estado
Solicitado por
Aprobado por
Recibido por
```

Estados:

```text
REQUESTED
APPROVED
DISPATCHED
IN_TRANSIT
RECEIVED
REJECTED
CANCELLED
```

---

# 27. Reporte de detalle de traslado

Campos:

```text
Producto
Lote
Cantidad solicitada
Cantidad enviada
Cantidad recibida
Diferencia
```

Este reporte es importante para auditoría.

---

# 28. Tiempo de traslado

KPI:

```text
Fecha recepción - Fecha despacho
```

Permite calcular:

```text
Tiempo promedio de traslado
Traslados atrasados
Traslados pendientes
```

---

# 29. Reportes de caja

Los reportes deben permitir auditar:

```text
Apertura
Ingresos
Ventas
Retiros
Gastos
Cierre
Diferencia
```

---

# 30. Cierre de caja

Campos:

```text
Sucursal
Caja
Cajero
Fecha apertura
Fecha cierre
Saldo inicial
Ventas efectivo
Ingresos
Egresos
Saldo esperado
Saldo contado
Diferencia
```

---

# 31. Diferencias de caja

Campos:

```text
Sucursal
Caja
Cajero
Fecha
Esperado
Real
Diferencia
Motivo
Autorizado por
```

---

# 32. Flujo de efectivo

Debe mostrar:

```text
Saldo inicial
Ingresos
Egresos
Saldo final
```

Ingresos:

```text
Ventas
Otros ingresos
Reintegros
```

Egresos:

```text
Compras
Gastos
Caja chica
Planilla
Servicios
Transporte
Mantenimiento
```

---

# 33. Flujo de efectivo consolidado

Disponible para usuarios corporativos.

Debe permitir agrupar:

```text
Por sucursal
Por departamento
Por región
Total empresa
```

---

# 34. Compras

Reporte:

```text
Compras por proveedor
```

Campos:

```text
Proveedor
Órdenes
Productos comprados
Unidades
Subtotal
Impuestos
Total
```

---

# 35. Historial de precios de compra

Campos:

```text
Producto
Proveedor
Fecha
Precio anterior
Precio actual
Variación %
```

Permite evaluar proveedores.

---

# 36. Rendimiento de proveedores

Indicadores:

```text
Tiempo promedio de entrega
Pedidos completos
Pedidos parciales
Pedidos atrasados
Productos rechazados
Monto comprado
```

---

# 37. Rentabilidad

Reporte por:

```text
Producto
Categoría
Sucursal
Periodo
```

Fórmula básica:

```text
Utilidad Bruta = Venta - Costo
```

Margen:

```text
Margen % = Utilidad / Venta * 100
```

---

# 38. Rentabilidad por sucursal

Campos:

```text
Sucursal
Ventas
Costo productos
Utilidad bruta
Gastos
Utilidad estimada
Margen %
```

---

# 39. Rotación de inventario

Clasificación:

```text
Alta
Media
Baja
Sin movimiento
```

Puede definirse en base a ventas de:

```text
30 días
60 días
90 días
180 días
```

---

# 40. Productos sin movimiento

Campos:

```text
Producto
Sucursal
Existencia
Última venta
Días sin venta
Costo inventario
Vencimiento más próximo
```

---

# 41. Reporte de activos

Campos:

```text
Código activo
Descripción
Categoría
Sucursal
Fecha adquisición
Costo
Vida útil
Depreciación
Valor actual
Estado
```

Ejemplos:

```text
Computadora
Refrigerador
UPS
Servidor
Vehículo
Motocicleta
Lector de código
Mobiliario
```

---

# 42. Activos por sucursal

Debe permitir responder:

```text
¿Qué activos existen físicamente en cada farmacia?
```

Campos:

```text
Sucursal
Activo
Código
Responsable
Ubicación
Estado
Valor
```

---

# 43. Planilla

Campos:

```text
Sucursal
Empleado
Puesto
Salario
Bonificación
Horas extra
Descuentos
Total
```

Usuarios globales pueden ver consolidado.

Usuarios de sucursal únicamente su propia planilla si su rol lo permite.

---

# 44. Reportes de auditoría

Toda operación crítica debería registrar:

```text
Usuario
Fecha
Sucursal
Módulo
Acción
Registro
Valor anterior
Valor nuevo
```


---

# 45. Tabla de auditoría sugerida

Los campos OLD_VALUE y NEW_VALUE pueden guardarse en JSON.


# 47. Exportaciones

Los reportes deberían soportar:

```text
PDF
Excel
```

No todos necesitan los dos formatos

## PDF

Ideal para:

```text
Presentación
Auditoría
Firmas
Documentos oficiales
```

## Excel

Ideal para:

```text
Análisis
Filtros
Contabilidad
Auditoría
```
---



---

# 59. Snapshot de transacciones

En detalle de venta se recomienda guardar:

```text
product_name
sku
unit_price
unit_cost
discount
tax
quantity
```

aunque parte de esta información exista en catálogo.

Así los reportes históricos permanecen consistentes.

---

#
