# Módulo de Compras --- Sistema de Farmacias Multisucursal

## 1. Objetivo

Definir el funcionamiento del módulo de **Compras / Purchases** para una
cadena de farmacias con múltiples sucursales.

El módulo debe cubrir:

-   Solicitudes de compra.
-   Compras centralizadas.
-   Cotizaciones.
-   Aprobaciones.
-   Órdenes de compra.
-   Detalle de compras.
-   Recepción de medicamentos.
-   Lotes y fechas de vencimiento.
-   Cadena de frío.
-   Control de calidad y cuarentena.
-   Facturas de proveedores.
-   Conciliación Orden--Recepción--Factura.
-   Devoluciones a proveedores.
-   Integración con Inventario.
-   Integración con Transferencias.
-   Integración con Cuentas por Pagar.
-   Auditoría.

------------------------------------------------------------------------

## 2. Principio fundamental

Una **compra a proveedor** y una **transferencia entre sucursales** son
operaciones diferentes.

### Compra externa

``` text
Proveedor
    ↓
Orden de compra
    ↓
Bodega central / Sucursal
    ↓
Recepción
    ↓
Inventario
    ↓
Factura
    ↓
Cuenta por pagar
```

Existe una adquisición comercial y una obligación con un proveedor.

### Transferencia interna

``` text
Sucursal / Bodega A
        ↓
Solicitud de transferencia
        ↓
Despacho
        ↓
En tránsito
        ↓
Sucursal / Bodega B
```

No existe factura de proveedor ni cuenta por pagar porque el inventario
continúa perteneciendo a la misma empresa.

------------------------------------------------------------------------

## 3. Modelo organizacional

Se recomienda un modelo de **compras centralizadas con destinos
flexibles**.

Las sucursales detectan sus necesidades, pero el departamento de Compras
de Casa Matriz controla las compras externas.

``` text
Sucursal
    ↓
Necesidad de medicamento
    ↓
Solicitud de abastecimiento
    ↓
Verificar inventario global
    ↓
¿Existe excedente en otra ubicación?
   ├── Sí → Transferencia interna
   └── No
        ↓
Solicitud de compra
        ↓
Casa Matriz / Compras
        ↓
Consolidación
        ↓
Cotizaciones
        ↓
Selección proveedor
        ↓
Aprobación
        ↓
Orden de compra
        ↓
Proveedor
```

La entrega del proveedor puede realizarse a:

1.  Bodega central.
2.  Centro de distribución.
3.  Una sucursal específica.
4.  Varias sucursales, si la orden contempla entregas distribuidas.

------------------------------------------------------------------------

## 4. Submódulos

``` text
COMPRAS
│
├── Solicitudes de compra
├── Consolidación de necesidades
├── Cotizaciones
├── Comparación de proveedores
├── Aprobaciones
├── Órdenes de compra
├── Detalle de compra
├── Seguimiento
├── Recepciones
│   ├── Lotes
│   ├── Vencimientos
│   ├── Cadena de frío
│   ├── Calidad
│   └── Cuarentena
├── Facturas de proveedor
├── Conciliación
├── Devoluciones
├── Cuentas por pagar
├── Auditoría
└── Reportes
```

------------------------------------------------------------------------

## 5. Flujo general de compra

1.  Una sucursal o el sistema detecta necesidad de reabastecimiento.
2.  Se determina el stock realmente disponible.
3.  Se verifica el inventario de otras sucursales/bodegas.
4.  Si existe inventario transferible, se evalúa una transferencia.
5.  Si no existe inventario suficiente, se genera una solicitud de
    compra.
6.  Casa Matriz revisa la solicitud.
7.  Puede consolidar solicitudes de varias sucursales.
8.  Se solicitan cotizaciones.
9.  Se comparan proveedores.
10. Se selecciona proveedor.
11. Se ejecuta el flujo de aprobación.
12. Se genera la orden de compra.
13. El proveedor confirma la orden.
14. El proveedor entrega los medicamentos.
15. Se realiza la recepción física.
16. Se registran lotes y vencimientos.
17. Se realiza control farmacéutico cuando corresponda.
18. Las cantidades aceptadas ingresan al inventario.
19. Las cantidades rechazadas pasan a rechazo/cuarentena.
20. Se registra la factura.
21. Se ejecuta conciliación de tres vías.
22. La factura aprobada pasa a Cuentas por Pagar.
23. Se realiza el pago.
24. La orden se cierra.

------------------------------------------------------------------------

## 6. Solicitud de compra

La solicitud expresa una **necesidad**. No constituye todavía un
compromiso con un proveedor.

### PurchaseRequest

Campos sugeridos:

  Campo           Requerido   Descripción
  --------------- ----------- ----------------------
  requestId       Sí          Identificador
  requestNumber   Sí          Número visible
  branchId        Sí          Sucursal solicitante
  warehouseId     Sí          Bodega destino
  requestedBy     Sí          Usuario
  requestDate     Sí          Fecha
  requiredDate    Sí          Fecha requerida
  priority        Sí          Normal/Alta/Urgente
  reason          Sí          Motivo
  source          Sí          Manual/Automático
  status          Sí          Estado
  notes           No          Observaciones

### PurchaseRequestDetail

  Campo                Descripción
  -------------------- ------------------------
  productId            Producto
  quantityRequested    Cantidad
  unitOfMeasureId      Unidad
  currentStock         Stock físico
  availableStock       Stock disponible
  minimumStock         Stock mínimo
  maximumStock         Stock máximo
  averageConsumption   Consumo promedio
  suggestedQuantity    Sugerencia del sistema
  requestedQuantity    Cantidad final

------------------------------------------------------------------------

## 7. Reposición

Conceptualmente:

``` text
Stock disponible =
Stock físico
- Stock reservado
- Stock bloqueado
```

Una posible fórmula:

``` text
Necesidad =
Demanda esperada
+ Stock de seguridad
- Stock disponible
- Compras pendientes
- Transferencias entrantes
```

La fórmula debe ser configurable.

También deben considerarse:

-   Consumo histórico.
-   Estacionalidad.
-   Tiempo de entrega del proveedor.
-   Inventario en tránsito.
-   Próximos vencimientos.
-   Inventario bloqueado.
-   Demanda prevista.
-   Stock mínimo/máximo.

------------------------------------------------------------------------

## 8. Verificación multisucursal

Una necesidad no debe generar automáticamente una compra.

Ejemplo:

``` text
Panajachel necesita: 50

Panajachel disponible: 5
Sololá disponible: 500
Xela disponible: 20
```

El sistema debe evaluar si Sololá posee inventario transferible sin
comprometer su stock de seguridad.

Si puede cubrirse internamente:

``` text
Solicitud
    ↓
Transferencia Sololá → Panajachel
```

Si no:

``` text
Solicitud
    ↓
Compra externa
```

------------------------------------------------------------------------

## 9. Consolidación

Casa Matriz puede consolidar necesidades.

``` text
Sololá       100
Panajachel    50
Xela         300
Cobán        100
----------------
Compra       550
```

Debe conservarse la asignación original.

### PurchaseAllocation

``` text
purchaseDetailId
branchId
requestDetailId
quantityAllocated
```

Ejemplo:

``` text
PO-1005 / Amoxicilina / 550

100 → Sololá
50  → Panajachel
300 → Xela
100 → Cobán
```

------------------------------------------------------------------------

## 10. Cotizaciones

Debe permitirse solicitar cotizaciones a varios proveedores.

Registrar:

-   Precio.
-   Descuento.
-   Impuestos.
-   Transporte.
-   Otros cargos.
-   Disponibilidad.
-   Cantidad disponible.
-   Tiempo de entrega.
-   Condiciones de pago.
-   Vigencia.
-   Vida útil ofrecida.
-   Condiciones de almacenamiento.
-   Cadena de frío.
-   Documentos adjuntos.

La selección no debe depender únicamente del menor precio.

Pueden evaluarse:

-   Costo total.
-   Disponibilidad.
-   Tiempo de entrega.
-   Calidad.
-   Historial del proveedor.
-   Cumplimiento.
-   Vida útil.
-   Condiciones farmacéuticas.

------------------------------------------------------------------------

## 11. Aprobaciones

Estados:

``` text
DRAFT
  ↓
SUBMITTED
  ↓
PENDING_APPROVAL
  ↓
APPROVED / REJECTED
```

Las políticas pueden depender de:

-   Monto.
-   Categoría.
-   Sucursal.
-   Urgencia.
-   Producto.
-   Medicamento controlado.
-   Proveedor.

Los límites deben ser configurables.

Registrar:

``` text
approvedBy
approvedAt
approvalLevel
comments
```

------------------------------------------------------------------------

## 12. Orden de compra

### Purchase

Campos sugeridos:

``` text
purchaseId
purchaseNumber

supplierId
branchId
warehouseId

purchaseRequestId
quotationId

orderDate
expectedDeliveryDate

currencyId
exchangeRate

subtotal
discount
tax
shippingCost
otherCharges
total

paymentTermsId
deliveryTerms

status

createdBy
approvedBy
approvedAt

notes

createdAt
updatedAt
```

------------------------------------------------------------------------

## 13. Detalle de compra

### PurchaseDetail

``` text
purchaseDetailId
purchaseId

productId

quantityOrdered
quantityReceived
quantityPending
quantityRejected

unitOfMeasureId

unitPrice
discountPercentage
discountAmount

taxPercentage
taxAmount

subtotal
total

expectedDeliveryDate

status
```

No debe depender del detalle de compra el almacenamiento definitivo de
lote y vencimiento.

Una línea de 100 unidades puede recibirse como:

``` text
40 → lote A → vence 2027-05
30 → lote B → vence 2027-08
30 → lote C → vence 2028-01
```

Por eso esos datos pertenecen principalmente a la recepción.

------------------------------------------------------------------------

## 14. Estados de orden

``` text
DRAFT
    ↓
PENDING_APPROVAL
    ↓
APPROVED
    ↓
SENT_TO_SUPPLIER
    ↓
CONFIRMED
    ↓
PARTIALLY_RECEIVED
    ↓
RECEIVED
    ↓
INVOICED
    ↓
CLOSED
```

Alternativos:

``` text
REJECTED
CANCELLED
PARTIALLY_CANCELLED
```

------------------------------------------------------------------------

## 15. Recepción

La recepción debe ser independiente de la orden.

Una orden puede tener múltiples recepciones.

Ejemplo:

``` text
Ordenado: 100

Recepción 1: 40
Recepción 2: 35
Recepción 3: 25
```

Nunca modificar `quantityOrdered` para hacerla coincidir con lo
recibido.

Debe conservarse:

``` text
Ordered:  100
Received:  75
Pending:   25
```

### PurchaseReceipt

``` text
receiptId
receiptNumber
purchaseId
warehouseId
receivedAt
receivedBy
verifiedBy
supplierDeliveryDocument
status
notes
```

### PurchaseReceiptDetail

``` text
receiptDetailId
receiptId
purchaseDetailId
productId

quantityReceived
quantityAccepted
quantityRejected

batchNumber
manufacturingDate
expirationDate

storageCondition
temperatureAtReception

warehouseId
locationId

qualityStatus
rejectionReason

receivedBy
verifiedBy
```

------------------------------------------------------------------------

## 16. Recepción farmacéutica

Validar:

-   Producto correcto.
-   Presentación correcta.
-   Cantidad.
-   Integridad del empaque.
-   Lote.
-   Fecha de vencimiento.
-   Vida útil restante.
-   Condiciones de transporte.
-   Temperatura, cuando aplique.
-   Daños.
-   Producto sospechoso.
-   Documentación requerida.

Solo la cantidad aceptada aumenta el inventario disponible.

Ejemplo:

``` text
Recibido: 100

Aceptado: 92
Dañado:    3
Rechazado: 5

AVAILABLE  +92
QUARANTINE +8
```

------------------------------------------------------------------------

## 17. Lotes

Debe mantenerse trazabilidad:

``` text
Proveedor
    ↓
Orden de compra
    ↓
Recepción
    ↓
Lote
    ↓
Inventario
    ↓
Transferencia
    ↓
Sucursal
    ↓
Venta
```

El lote debe permitir conocer:

-   Proveedor original.
-   Orden.
-   Recepción.
-   Fecha de ingreso.
-   Fecha de fabricación.
-   Fecha de vencimiento.
-   Ubicación actual.
-   Movimientos.
-   Cantidad disponible.

------------------------------------------------------------------------

## 18. FEFO

Para medicamentos con vencimiento se debe soportar:

**First Expiry, First Out.**

Ejemplo:

``` text
Lote A → vence 2028 → 50
Lote B → vence 2027 → 40
Lote C → vence 2029 → 80
```

La salida debe priorizar:

``` text
Lote B
```

aunque no haya sido el primero recibido.

------------------------------------------------------------------------

## 19. Vida útil mínima

Debe poder configurarse una política de vida útil mínima.

Ejemplo conceptual:

``` text
remainingShelfLife =
expirationDate - receptionDate
```

La política puede variar por:

-   Producto.
-   Categoría.
-   Proveedor.
-   Tipo de medicamento.

No debe existir un único valor fijo para todos los medicamentos.

------------------------------------------------------------------------

## 20. Cadena de frío

Los productos que lo requieran deben tener configuradas sus condiciones
de almacenamiento.

Ejemplo:

``` text
Producto: Insulina
Condición configurada: 2°C – 8°C
```

Recepción:

``` text
Temperatura: 5°C
→ aceptar
```

o:

``` text
Temperatura fuera de condición
→ QUARANTINE
→ evaluación
→ liberar o rechazar
```

Estados sugeridos:

``` text
AVAILABLE
QUARANTINE
REJECTED
DAMAGED
EXPIRED
RECALLED
```

------------------------------------------------------------------------

## 21. Factura del proveedor

La factura debe ser independiente de la orden.

### SupplierInvoice

``` text
supplierInvoiceId
supplierId
invoiceNumber
invoiceDate
dueDate

currencyId
exchangeRate

purchaseId

subtotal
tax
discount
total

status

documentAttachment
createdBy
createdAt
```

Una orden puede generar varias facturas.

------------------------------------------------------------------------

## 22. 3-Way Matching

Comparar:

``` text
ORDEN DE COMPRA
      ↕
RECEPCIÓN
      ↕
FACTURA
```

Validaciones:

-   Cantidad ordenada.
-   Cantidad recibida.
-   Cantidad facturada.
-   Precio ordenado.
-   Precio facturado.
-   Impuestos.
-   Descuentos.
-   Total.

Ejemplo:

``` text
Orden:     100 × Q10
Recepción:  95
Factura:   100 × Q10

Resultado:
DISCREPANCIA
```

Las tolerancias deben ser configurables.

Las diferencias fuera de tolerancia deben bloquear el proceso o requerir
aprobación.

------------------------------------------------------------------------

## 23. Devoluciones a proveedor

Debe registrarse:

``` text
purchaseReturnId
supplierId
purchaseId
receiptId
productId
batchNumber
quantity
reason
status
createdBy
createdAt
```

La devolución debe mantener relación con:

-   Proveedor.
-   Compra.
-   Recepción.
-   Producto.
-   Lote.

------------------------------------------------------------------------

## 24. Medicamentos controlados

El diseño debe soportar controles adicionales.

Campos sugeridos del producto:

``` text
isControlledSubstance
controlledSubstanceType
requiresPurchaseAuthorization
```

Autorización:

``` text
authorizationNumber
authorizationDate
authorizedQuantity
usedQuantity
expirationDate
document
approvedBy
```

El sistema debe impedir exceder la cantidad autorizada cuando la
regulación/política aplicable así lo requiera.

------------------------------------------------------------------------

## 25. Compra local excepcional

Regla general:

``` text
Compra centralizada
```

Excepción:

``` text
Compra local de sucursal
```

Puede habilitarse para:

-   Emergencia.
-   Producto local.
-   Monto limitado.
-   Falta de abastecimiento.
-   Autorización especial.

Debe registrar:

-   Motivo.
-   Usuario.
-   Autorización.
-   Sucursal.
-   Proveedor.
-   Evidencia.

------------------------------------------------------------------------

## 26. Reglas de negocio

-   **RN-COM-001:** Toda orden debe tener proveedor, destino y al menos
    un producto.
-   **RN-COM-002:** Solo proveedores habilitados pueden recibir órdenes.
-   **RN-COM-003:** Una necesidad puede generarse manual o
    automáticamente.
-   **RN-COM-004:** Antes de comprar externamente debe evaluarse
    inventario transferible de la red.
-   **RN-COM-005:** Compras sujetas a aprobación no pueden emitirse sin
    autorización.
-   **RN-COM-006:** Una orden aprobada no puede modificarse sin
    trazabilidad.
-   **RN-COM-007:** `quantityOrdered` no se reemplaza con
    `quantityReceived`.
-   **RN-COM-008:** Se permiten recepciones parciales.
-   **RN-COM-009:** Una orden puede tener múltiples recepciones.
-   **RN-COM-010:** Una orden puede tener múltiples facturas.
-   **RN-COM-011:** Productos sujetos a lote deben registrar lote.
-   **RN-COM-012:** Productos sujetos a vencimiento deben registrar
    fecha de vencimiento.
-   **RN-COM-013:** Solo cantidades aceptadas incrementan inventario
    disponible.
-   **RN-COM-014:** Productos rechazados/no conformes deben segregarse.
-   **RN-COM-015:** Productos con condiciones especiales deben
    validarlas durante recepción.
-   **RN-COM-016:** Las diferencias de recepción deben registrarse.
-   **RN-COM-017:** El pago puede depender de conciliación de tres vías.
-   **RN-COM-018:** Las tolerancias deben ser configurables.
-   **RN-COM-019:** Productos con vencimiento deben soportar FEFO.
-   **RN-COM-020:** Medicamentos controlados deben cumplir las
    autorizaciones correspondientes.
-   **RN-COM-021:** Toda operación crítica registra usuario, fecha/hora
    y sucursal.
-   **RN-COM-022:** Documentos auditables no se eliminan físicamente; se
    cancelan/anulan conservando historial.
-   **RN-COM-023:** Devoluciones mantienen relación con recepción, lote
    y proveedor.
-   **RN-COM-024:** Debe existir trazabilidad hasta el proveedor
    original.
-   **RN-COM-025:** Una transferencia interna no genera factura de
    proveedor ni cuenta por pagar.
-   **RN-COM-026:** La compra consolidada debe conservar cantidades
    asignadas a cada sucursal.
-   **RN-COM-027:** No debe transferirse inventario que comprometa el
    stock de seguridad del origen salvo excepción autorizada.
-   **RN-COM-028:** Inventario bloqueado, vencido, retirado o en
    cuarentena no es stock disponible.

------------------------------------------------------------------------

## 27. Roles

### Solicitante de sucursal

-   Crear solicitudes.
-   Consultar estado.
-   Justificar necesidades.

### Encargado de bodega

-   Revisar necesidades.
-   Recibir mercancía.
-   Registrar cantidades.
-   Registrar lotes.

### Comprador central

-   Consolidar solicitudes.
-   Solicitar cotizaciones.
-   Comparar proveedores.
-   Preparar órdenes.

### Aprobador / Gerencia

-   Aprobar o rechazar.
-   Autorizar excepciones.

### Regente / Control de calidad

-   Revisar condiciones farmacéuticas.
-   Gestionar cuarentena.
-   Liberar/rechazar productos según procedimiento.

### Cuentas por pagar

-   Registrar facturas.
-   Ejecutar conciliación.
-   Gestionar obligaciones.

### Auditor

-   Consultar documentos e historial.
-   No modificar transacciones.

------------------------------------------------------------------------

## 28. Segregación de funciones

Cuando sea posible:

-   Quien solicita no aprueba su propia compra.
-   Quien compra no debe aprobar sin controles.
-   Quien registra factura no debe alterar la recepción.
-   Quien recibe no debe modificar la orden aprobada.
-   Las excepciones deben quedar auditadas.

------------------------------------------------------------------------

## 29. Integraciones

### Inventario

Recibe:

-   Entradas aceptadas.
-   Lotes.
-   Vencimientos.
-   Ubicaciones.
-   Movimientos.

### Transferencias

Permite cubrir necesidades internas antes de comprar externamente.

### Proveedores

Proporciona:

-   Estado.
-   Condiciones.
-   Productos.
-   Historial.
-   Desempeño.

### Cuentas por pagar

Recibe facturas conciliadas/aprobadas.

### Auditoría

Registra:

-   Creación.
-   Cambios.
-   Aprobaciones.
-   Rechazos.
-   Recepciones.
-   Cancelaciones.
-   Excepciones.

------------------------------------------------------------------------




------------------------------------------------------------------------

## 32. Reportes

-   Compras por proveedor.
-   Compras por sucursal.
-   Compras por producto.
-   Compras por categoría.
-   Compras por período.
-   Órdenes pendientes.
-   Entregas atrasadas.
-   Recepciones parciales.
-   Cantidades pendientes.
-   Variación histórica de precios.
-   Cumplimiento de proveedores.
-   Productos rechazados.
-   Productos en cuarentena.
-   Compras de emergencia.
-   Compras locales excepcionales.
-   Productos recibidos próximos a vencer.
-   Diferencias de conciliación.
-   Compras de medicamentos controlados.
-   Trazabilidad por lote.

------------------------------------------------------------------------

## 33. KPIs

-   Tiempo Solicitud → Aprobación.
-   Tiempo Aprobación → Orden.
-   Tiempo Orden → Recepción.
-   Lead time por proveedor.
-   Porcentaje de entregas a tiempo.
-   Porcentaje de órdenes completas.
-   Porcentaje de rechazo.
-   Diferencia de precio.
-   Porcentaje de compras de emergencia.
-   Valor de compras por sucursal.
-   Valor de compras por proveedor.
-   Cantidad de discrepancias de factura.
-   Vencimientos asociados a compras.

------------------------------------------------------------------------

## 34. Plantillas operativas

El sistema debe contemplar documentos como:

1.  Solicitud de compra.
2.  Solicitud de cotización (RFQ).
3.  Cuadro comparativo de proveedores.
4.  Orden de compra (PO).
5.  Documento de recepción.
6.  Formulario de inspección farmacéutica.
7.  Registro de temperatura.
8.  Acta de cuarentena/rechazo.
9.  Devolución a proveedor.
10. Conciliación Orden--Recepción--Factura.
11. Historial de aprobación.
12. Historial de auditoría.

------------------------------------------------------------------------

## 35. Auditoría

Registrar como mínimo:

``` text
userId
branchId
action
entity
entityId
previousValue
newValue
reason
dateTime
ip/device (si la política lo requiere)
```

Operaciones especialmente auditables:

-   Aprobaciones.
-   Cambio de cantidades.
-   Cambio de precios.
-   Cancelaciones.
-   Recepciones.
-   Rechazos.
-   Liberación de cuarentena.
-   Facturas.
-   Excepciones.
-   Devoluciones.

------------------------------------------------------------------------

## 36. Criterios mínimos de aceptación

El módulo se considera funcionalmente completo cuando:

-   Distingue compra externa de transferencia interna.
-   Permite solicitudes por sucursal.
-   Verifica disponibilidad en la red.
-   Consolida necesidades.
-   Gestiona cotizaciones.
-   Maneja aprobaciones.
-   Genera órdenes.
-   Permite entrega central o directa.
-   Soporta recepciones parciales.
-   Soporta múltiples lotes.
-   Controla vencimientos.
-   Soporta cadena de frío.
-   Maneja cuarentena/rechazos.
-   Solo ingresa cantidades aceptadas al inventario.
-   Mantiene trazabilidad del lote.
-   Registra facturas independientemente.
-   Soporta 3-way matching.
-   Gestiona devoluciones.
-   Mantiene auditoría.
-   Produce reportes operativos y gerenciales.

------------------------------------------------------------------------



------------------------------------------------------------------------

## 38. Referencias

-   Microsoft Learn --- Purchase order creation overview:
    https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/purchase-order-creation

-   Microsoft Learn --- Product receipt against purchase orders:
    https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/product-receipt-against-purchase-orders

-   Microsoft Learn --- Accounts payable invoice matching:
    https://learn.microsoft.com/en-us/dynamics365/finance/accounts-payable/accounts-payable-invoice-matching

-   WHO --- Good distribution practices for pharmaceutical products:
    https://www.who.int/publications/m/item/trs-1025-annex-7

-   MSPAS Guatemala --- Manejo y compra de sustancias controladas:
    https://medicamentos.mspas.gob.gt/index.php/servicios/sustancias-controladas/manejo-y-compra
