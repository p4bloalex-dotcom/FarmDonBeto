# Diagramas UML de actividades del sistema

Diagramas en sintaxis PlantUML compatible con draw.io. Cada diagrama representa el flujo de actividades de un proceso importante del sistema, basado en el codigo del backend.

## 1. Registrar venta en caja

Fuente principal: `Core/src/modules/catalog/sales/sale.repository.js`.

```plantuml
@startuml
title Actividad 1 - Registrar venta en caja

skinparam shadowing false
skinparam roundcorner 18
skinparam defaultFontName Arial
skinparam ArrowColor #334155
skinparam ActivityBorderColor #1E293B
skinparam ActivityFontColor #0F172A
skinparam activity {
  BackgroundColor #EFF6FF
  BorderColor #2563EB
}

start

partition "Vendedor / Cajero" #DCFCE7 {
  :Ingresa productos, cantidades,
  caja y forma de pago;
}

partition "Sistema Farmacia" #DBEAFE {
  :Recibe solicitud de venta;
  :Valida sesion de caja abierta;
}

if (Caja abierta y pertenece a la sucursal?) then (Si)
  partition "Catalogo e inventario" #FEF3C7 {
    :Consulta medicamentos activos;
    :Valida cantidad y precio;
    :Verifica stock disponible;
  }

  if (Stock suficiente?) then (Si)
    partition "Inventario" #EDE9FE {
      :Consume lotes FEFO;
      :Descuenta stock disponible;
      :Registra kardex de salida;
    }

    partition "Ventas y caja" #D1FAE5 {
      :Calcula subtotal, impuesto y total;
      :Valida que pagos cubran el total;
    }

    if (Pago valido?) then (Si)
      partition "Persistencia" #F3F4F6 {
        :Guarda venta;
        :Guarda detalle de venta;
        :Guarda pagos;
        :Genera comprobante REC-########;
      }

      if (Pago en efectivo?) then (Si)
        partition "Caja" #FEF9C3 {
          :Registra movimiento de caja SALE;
        }
      else (No)
        :No registra movimiento de efectivo;
      endif

      partition "Sistema Farmacia" #DBEAFE {
        :Retorna id de venta y confirmacion;
      }
      stop
    else (No)
      :Rechaza venta por pago insuficiente o invalido;
      stop
    endif
  else (No)
    :Rechaza venta por stock insuficiente;
    stop
  endif
else (No)
  :Rechaza venta por caja cerrada o incorrecta;
  stop
endif

@enduml
```

## 2. Crear y recibir orden de compra

Fuente principal: `Core/src/modules/catalog/purchases/purchase.repository.js`.

```plantuml
@startuml
title Actividad 2 - Crear y recibir orden de compra

skinparam shadowing false
skinparam roundcorner 18
skinparam defaultFontName Arial
skinparam ArrowColor #334155
skinparam ActivityBorderColor #1E293B
skinparam ActivityFontColor #0F172A
skinparam activity {
  BackgroundColor #FFF7ED
  BorderColor #EA580C
}

start

partition "Responsable de compras" #FFE4E6 {
  :Ingresa proveedor, sucursal,
  productos, cantidades y precios;
}

partition "Sistema Farmacia" #DBEAFE {
  :Recibe solicitud de orden de compra;
  :Valida que exista al menos un producto;
  :Valida cantidades y precios;
}

if (Datos de orden validos?) then (Si)
  partition "Compras" #FFE4E6 {
    :Calcula subtotal y total;
    :Crea orden de compra;
    :Asigna estado PENDING_APPROVAL;
    :Guarda detalles con estado ORDERED;
  }

  if (Proviene de solicitudes de compra?) then (Si)
    :Relaciona solicitudes seleccionadas;
    :Actualiza solicitud a ORDERED
    si todos sus detalles fueron ordenados;
  else (No)
    :Continua sin solicitud relacionada;
  endif

  partition "Responsable de compras" #FFE4E6 {
    :Aprueba orden de compra;
  }

  partition "Sistema Farmacia" #DBEAFE {
    :Actualiza orden a APPROVED;
  }

  partition "Responsable de compras" #FFE4E6 {
    :Registra recepcion de productos;
  }

  partition "Compras" #FFE4E6 {
    :Valida que la orden este APPROVED
    o PARTIALLY_RECEIVED;
  }

  if (Orden puede recibirse?) then (Si)
    :Crea recepcion con estado RECEIVED;
    :Calcula cantidad recibida,
    aceptada, rechazada y pendiente;
    :Actualiza detalles como
    PARTIALLY_RECEIVED o RECEIVED;

    if (Hay productos aceptados?) then (Si)
      partition "Inventario" #EDE9FE {
        :Exige lote y vencimiento;
        :Registra lote en QUARANTINE;
      }
    else (No)
      :No ingresa lote aceptado;
    endif

    if (Quedan pendientes?) then (Si)
      :Actualiza compra a PARTIALLY_RECEIVED;
    else (No)
      :Actualiza compra a RECEIVED;
      :Genera solicitudes de entrega automaticas
      si abastece otras sucursales;
    endif

    stop
  else (No)
    :Rechaza recepcion por estado no permitido;
    stop
  endif
else (No)
  :Rechaza orden por datos invalidos;
  stop
endif

@enduml
```

## 3. Pedido de cliente hasta entrega

Fuente principal: `Core/src/modules/catalog/customer-orders/customer-order.repository.js`.

```plantuml
@startuml
title Actividad 3 - Pedido de cliente hasta entrega

skinparam shadowing false
skinparam roundcorner 18
skinparam defaultFontName Arial
skinparam ArrowColor #334155
skinparam ActivityBorderColor #1E293B
skinparam ActivityFontColor #0F172A
skinparam activity {
  BackgroundColor #FDF2F8
  BorderColor #DB2777
}

start

partition "Cliente" #FCE7F3 {
  :Solicita pedido con direccion,
  productos y forma de pago;
}

partition "Operador" #DBEAFE {
  :Registra datos del pedido;
}

partition "Sistema Farmacia" #D1FAE5 {
  :Valida coordenadas de entrega;
  :Valida metodo y estado de pago;
}

if (Pago inicial valido?) then (Si)
  partition "Geolocalizacion" #CCFBF1 {
    :Calcula cobertura, distancia
    y tiempo estimado;
  }

  partition "Inventario" #FEF3C7 {
    :Busca sucursal disponible;
    :Valida stock suficiente;
  }

  if (Sucursal puede cumplir?) then (Si)
    :Consulta medicamentos activos;
    :Calcula subtotal y total;
    :Reserva stock;
    :Crea pedido con estado P;
    :Guarda detalle del pedido;

    partition "Operador" #DBEAFE {
      :Marca pedido en ruta;
    }

    if (Pedido esta pendiente?) then (Si)
      :Actualiza estado a S;
    else (No)
      :Rechaza cambio a en ruta;
      stop
    endif

    partition "Operador" #DBEAFE {
      :Confirma entrega;
    }

    if (Pedido esta en ruta?) then (Si)
      partition "Inventario" #FEF3C7 {
        :Valida reserva;
        :Consume lotes FEFO;
        :Descuenta reserva y stock;
        :Registra kardex CUSTOMER_ORDER_DELIVERY;
      }

      if (Pago confirmado o contra entrega?) then (Si)
        partition "Ventas y caja" #DCFCE7 {
          :Valida caja abierta;
          :Valida empleado activo;
          :Genera venta CALL_CENTER;
          :Registra pago;
          :Registra movimiento de caja
          si corresponde;
        }

        :Actualiza pedido a D;
        :Asocia saleId;
        :Marca paymentStatus PAID
        si es contra entrega;
        stop
      else (No)
        :Rechaza entrega por pago no confirmado;
        stop
      endif
    else (No)
      :Rechaza entrega por estado incorrecto;
      stop
    endif
  else (No)
    :Rechaza pedido por falta de stock
    o fuera de cobertura;
    stop
  endif
else (No)
  :Rechaza pedido por pago invalido;
  stop
endif

@enduml
```

## 4. Solicitud de entrega entre sucursales

Fuente principal: `Core/src/modules/catalog/delivery-requests/delivery-request.repository.js`.

```plantuml
@startuml
title Actividad 4 - Solicitud de entrega entre sucursales

skinparam shadowing false
skinparam roundcorner 18
skinparam defaultFontName Arial
skinparam ArrowColor #334155
skinparam ActivityBorderColor #1E293B
skinparam ActivityFontColor #0F172A
skinparam activity {
  BackgroundColor #ECFEFF
  BorderColor #0891B2
}

start

partition "Sucursal solicitante" #FCE7F3 {
  :Crea solicitud de entrega;
  :Indica sucursal que entrega
  y productos requeridos;
}

partition "Sistema Farmacia" #D1FAE5 {
  :Guarda solicitud con estado P;
  :Guarda detalle de productos;
}

partition "Sucursal que entrega" #FEF3C7 {
  :Revisa solicitud pendiente;
}

if (Acepta solicitud?) then (Si)
  partition "Sistema Farmacia" #D1FAE5 {
    :Valida actor autorizado
    por sucursal o permiso global;
    :Cambia estado P -> A;
  }

  partition "Sucursal que entrega" #FEF3C7 {
    :Prepara productos;
    :Marca solicitud enviada;
  }

  partition "Sistema Farmacia" #D1FAE5 {
    :Valida transicion A -> S;
    :Actualiza estado a S;
  }

  partition "Sucursal solicitante" #FCE7F3 {
    :Confirma recepcion de productos;
  }

  partition "Sistema Farmacia" #D1FAE5 {
    :Valida transicion S -> D;
    :Busca tipo de movimiento TRASPASO;
    :Consulta detalle de solicitud;
  }

  if (Tipo TRASPASO configurado?) then (Si)
    partition "Inventario" #EDE9FE {
      :Crea traspaso de inventario;
      :Registra MoveInventory status E;
      :Asocia movementId a solicitud;
    }

    :Actualiza solicitud a D;
    :Registra deliveredAt;
    stop
  else (No)
    :Rechaza entrega por tipo
    de movimiento no configurado;
    stop
  endif
else (No)
  if (Rechaza?) then (Si)
    :Valida transicion P -> R;
    :Actualiza estado a R;
    stop
  else (Cancelar)
    :Valida sucursal involucrada;
    :Actualiza estado a C;
    stop
  endif
endif

@enduml
```
