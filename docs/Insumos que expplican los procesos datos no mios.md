# Insumos reales para justificar los módulos del sistema de farmacia

Fecha de consulta: 8 de octubre de 2026.
Documento base: modulos-sistema-acciones(3).md, fechado el 7 de octubre de 2026.
Actualización: ajustes funcionales comunicados por Alex el 8 de octubre de 2026. No se recibió una nueva versión del documento de módulos; esta matriz incorpora esos ajustes como alcance declarado.

## 1. Alcance y criterio

El proyecto puede conservar una empresa ficticia y utilizar fuentes reales de distintas organizaciones. Este documento relaciona las 31 pantallas o áreas funcionales concretas del archivo con insumos públicos e incorpora los ajustes declarados por el autor. No verifica código ni certifica cumplimiento legal.

La relación fuente → módulo es un análisis de esta investigación. Una coincidencia funcional no demuestra que la empresa citada use los mismos estados, permisos, pantallas o automatizaciones.

Tipos de respaldo:

- **Operación documentada:** evidencia de una empresa o investigación de campo. Describe el período estudiado.
- **Institucional/técnico farmacéutico:** formularios, registros públicos y guías. No demuestra adopción por una cadena particular.
- **Referencia de software:** documentación del fabricante de un sistema empresarial existente. Explica un flujo de referencia, no la operación observada de una farmacia.
- **Decisión de diseño:** adaptación propia que debe explicarse, aunque el proceso general tenga respaldo.

Para cada fuente se indica su identificación, enlace y parte útil en el catálogo final. Las fuentes de Batres y Galeno son históricas. No deben emplearse para afirmar problemas actuales. Las guías OMS son recomendaciones internacionales, no legislación guatemalteca por sí mismas.

## 2. Matriz por pantalla o módulo

### Seguridad

| Pantalla | Insumo | Relación con el módulo | Criterio del proyecto |
| --- | --- | --- | --- |
| Usuarios | I14 e I15: accesos Odoo y autorización OWASP | Cuentas y derechos de acceso. | Mantener. La obligación de crear primero al empleado es una decisión propia. |
| Roles | I14: Access rights, apartado Manage roles/groups | Agrupación de derechos para usuarios. | Mantener roles separados de puestos laborales. |
| Menús | I14: gestión de permisos y grupos | Respaldo general de acceso a aplicaciones/contenido. | Mantener como configuración de navegación; crear iconos/rutas no es un proceso farmacéutico documentado. |
| Menús por rol | I14 e I15 | Relación entre perfil y acceso. | Mantener. Ocultar una pantalla no sustituye autorización. |
| Permisos | I15: Least privileges, Validate permissions, controles por objeto | Restricción de operaciones y recursos. | Mantener rol + acción + sucursal; el atributo Matriz no debe conceder alcance global automáticamente. Esta combinación es tu adaptación. |

### Empresa, sucursales y personal

| Módulo | Insumo | Relación con el módulo | Criterio del proyecto |
| --- | --- | --- | --- |
| Empresa | I09: encabezado patronal de planilla | Identifica patrono, nombre comercial y NIT. | Mantener como datos maestros; no requiere un flujo diario independiente. |
| Sucursales | I06 e I07: formularios y modificaciones de licencia | Administración del establecimiento y cambios de dirección/director técnico. | Mantener ubicación y datos sanitarios. Cobertura y tiempo de entrega son parámetros propios. |
| Personal | I09: registros de empleados; I20: Employees | Identificación laboral y asociación con centro de trabajo. | Mantener. Incorporar referencias de afiliación/NIT/altas y bajas si la nómina las utiliza. |

La existencia del campo director técnico no confirma que un mismo profesional pueda atender cualquier número de sucursales. No presentar esa posibilidad como regla legal validada.

### Catálogos farmacéuticos

| Pantalla | Insumo | Relación con el módulo | Criterio del proyecto |
| --- | --- | --- | --- |
| Medicamentos | I08: consulta MSPAS | Identificación del producto, registro, principio activo, presentación y estado. | Mantener y distinguir producto, lote y registro sanitario. |
| Categorías de medicina | I08: clase terapéutica | Clasificación de productos. | Mantener; categorías comerciales propias pueden coexistir con clasificación terapéutica. |
| Laboratorios | I24: búsqueda de Galeno por laboratorio | Consulta comercial por laboratorio. | Mantener. Titular, fabricante y distribuidor son conceptos distintos. |
| Presentaciones | I08: forma farmacéutica, presentación y envase | Describe cómo se identifica y comercializa un producto. | Separar forma farmacéutica —tableta/jarabe— de presentación comercial —caja/frasco— cuando sea necesario. |
| Unidades de medida | I17: Units of measure | Conversión entre cantidades de compra y venta/inventario. | Venta fraccionada con conversión caja/blíster/unidad cuando corresponda; su disponibilidad no supone autorización para fraccionar cualquier medicamento. |

La consulta sanitaria examinada contiene registros de distintos estados y fechas. Sirve como insumo de estructura; no se afirma la autorización vigente de un medicamento concreto a partir de una fila aislada.

### Proveedores, inventario, compras y traslados

| Módulo/pantalla | Insumo | Relación con el módulo | Criterio del proyecto |
| --- | --- | --- | --- |
| Proveedores | I18: lista de proveedores/precios; I02: relaciones comerciales | Maestro comercial utilizado para abastecimiento. | Mantener; el procedimiento de alta y desactivación es propio. |
| Medicamentos por proveedor | I18: vendor pricelists | Asociación proveedor-producto. | Mantener; precio y plazo pueden ser mejoras, no requisitos para justificar la relación actual. |
| Inventario | I05: §§12–13 y 17; I01: proceso logístico | Lotes, rotación FEFO, estados, movimientos y conciliación. | Se distinguen existencia física, disponible, reservada, bloqueada/cuarentena y tránsito. El lote no apto se bloquea y registra motivo/propuesta de disposición. Conteos y conciliación siguen como precisión pendiente si no están documentados. |
| Compras | I01: recepción; I04: conciliación; I11: facturas de proveedor | Contraste mercadería/documentación y relación recepción-factura. | Se separan conciliación comercial, validación sanitaria y pago. Según política interna, una factura conciliada no se paga con validación sanitaria pendiente. Las devoluciones requieren cierre financiero. |
| Traslados entre sucursales | I01: requerimientos y despacho; I05: distribución/transporte | Abastecimiento desde almacén y conservación de trazabilidad. | Salida del origen → saldo en tránsito → entrada al destino. El traslado directo entre sucursales es una adaptación propia; falta precisar diferencias y recepción parcial si aún no están documentadas. |

En Batres se describen solicitudes de farmacia, carga al sistema, preparación y despacho, además del retorno de vencidos. Ese circuito respalda tu logística general, pero no confirma tus estados exactos.

### Ventas, pedidos y efectivo

| Módulo/pantalla | Insumo | Relación con el módulo | Criterio del proyecto |
| --- | --- | --- | --- |
| Ventas | I03: mostrador/cobros; I10: POS; I23: FEL | Registro de ventas, pagos y documentación. | El comprobante actual es interno y no constituye integración FEL. Las operaciones con efectos se anulan mediante reversión e historial; se eliminan únicamente registros sin efectos. |
| Call Center | I03: atención y reparto; I24: orden y seguimiento | Pedidos remotos y entrega. | Pedido, venta, pagos y movimientos se vinculan para evitar duplicaciones. La cantidad reservada se libera al cancelar o se consume al completar la operación. |
| Caja del día | I10: Workflow | Sesión, apertura, movimientos, conteo/cierre y diferencias. | Mantener. Distinguir efectivo de tarjetas/transferencias en el cierre. |
| Cajas | I10: creación/configuración de POS | Punto de cobro configurable. | Mantener caja física separada de sus sesiones. |
| Tipos de movimiento de caja | I10: cash-in/cash-out con motivo | Clasificación de entradas y retiros fuera de ventas. | Mantener como catálogo propio; la fuente no impone tus nombres. |
| Caja y bancos | I12: Bank reconciliation | Relación transacción bancaria, documento y pago. | Mantener. Si solo registras movimientos, no afirmar conciliación bancaria completa. |

### Nómina y activos

| Módulo/pantalla | Insumo | Relación con el módulo | Criterio del proyecto |
| --- | --- | --- | --- |
| Nómina | I09: liquidaciones y empleados; I19: salary rules | Períodos, sueldo, deducciones y cálculo. | El pago salarial se vincula con una cuenta financiera y su salida; la aprobación de la planilla debe detallarse si todavía no forma parte del flujo. |
| Puestos de nómina | I09: código de ocupación; I20: expediente de personal | Identificación del trabajo del empleado. | Mantener; un puesto interno no equivale automáticamente a un código IGSS. |
| Conceptos de nómina | I19: reglas/categorías salariales | Rubros que intervienen en el cálculo. | Mantener conceptos configurables; validar aparte fórmulas y obligaciones de Guatemala. |
| Activos fijos | I13: Register fixed assets y lifecycle | Ficha, ubicación, adquisición y baja. | Mantener control físico y responsable. Depreciación es una ampliación si se promete gestión contable. |

El manual IGSS respalda estructura de información de planilla; no demuestra que todas las fórmulas de tu módulo sean correctas ni que exista integración al IGSS. La planilla de seguridad social y el pago del salario son operaciones distintas.

### Supervisión

| Módulo | Insumo | Relación con el módulo | Criterio del proyecto |
| --- | --- | --- | --- |
| Reportes | I02: indicadores/rentabilidad; I21: Reporting | Análisis de resultados operativos y ventas. | Se informa margen estimado según ventas y costos disponibles, sin atribuir utilidad/rentabilidad neta. Precisar fórmula, período y tratamiento de devoluciones. |
| Auditoría | I16: Logging, Event attributes | Trazabilidad de acciones y cambios. | Mantener; registrar usuario, momento, acción, objeto y resultado. Restringir consulta. |
| Dashboard | I22: dashboards; I02: gestión por indicadores | Visualización resumida de información operacional. | Indicadores por perfil; cuando se muestre margen, mantener el mismo alcance y fórmula de Reportes. |

Seguridad, Empresa y Catálogos farmacéuticos son agrupadores de las pantallas detalladas; no requieren una evidencia adicional para cada encabezado. Caché, geolocalización, kardex y alcance local/global siguen dentro de los módulos, como ya los documentaste.

## 3. Insumos farmacéuticos que respaldan controles existentes

I05, OMS TRS 1025, anexo 7, aporta respaldo para:

- FEFO (§12.30).
- Recepción e identificación por lote (§§12.10–12.17).
- Separación de rechazados y liberación autorizada (§§12.17–12.18).
- Cuarentena de devoluciones (§9.2).
- Registro de entradas/salidas/ajustes y conciliación (§13.1).
- Documentación para rastrear distribución (§§17.10 y 18.16).

Estos apartados permiten fundamentar tu control sanitario. No establecen por sí solos que cada recepción en cualquier farmacia guatemalteca deba seguir tu mismo circuito ni que una factura deba bloquearse hasta la liberación sanitaria.

## 4. Ajustes incorporados y su relación con los insumos

Estado: incorporados a esta matriz a partir de la descripción del autor. No se verificó su implementación en código.

| N.º | Ajuste declarado | Módulos | Respaldo y límite |
| --- | --- | --- | --- |
| 1 | Un lote no apto no genera automáticamente una devolución definitiva. | Inventario y Compras | I05 respalda segregación; la automatización de disposición es diseño propio. |
| 2 | El lote no apto queda bloqueado, con motivo y propuesta de disposición. | Inventario y Auditoría | I05 e I16; bloqueo, motivo y trazabilidad se adaptan a las pantallas existentes. |
| 3 | La disposición admite devolución, investigación, destrucción u otra medida autorizada. | Inventario y Compras | I05; investigación no devuelve el lote a estado vendible. Una eventual liberación requiere decisión documentada. |
| 4 | Se distinguen cantidades físicas, disponibles, reservadas, bloqueadas, en cuarentena y en tránsito. | Inventario, Ventas, Call Center y Traslados | Diseño de saldos y disponibilidad del proyecto, apoyado en control de existencias. |
| 5 | Cuarentena y liberación son políticas internas del proyecto. | Compras e Inventario | I05 es fundamento técnico; no se afirma una regla legal universal ni su adopción exacta por Galeno. |
| 6 | Una factura comercialmente conciliada no se paga si falta validación sanitaria. | Compras y Caja y bancos | I04/I11 respaldan conciliación comercial. Condicionar el pago a validación sanitaria es política interna adicional. |
| 7 | Una devolución física requiere cierre financiero mediante nota de crédito, reembolso o ajuste documentado. | Compras y Caja y bancos | I02/I04 respaldan seguimiento de devoluciones; resolver su efecto financiero es parte del flujo adaptado. |
| 8 | Un pedido remoto no debe duplicar venta, cobro ni descuento de inventario. | Call Center, Ventas, Caja e Inventario | I03/I24 respaldan pedidos; prevención de duplicación y vínculo entre operaciones son controles propios. |
| 9 | Se diferencia eliminar de anular operaciones con efectos. | Módulos operativos y Auditoría | I16 respalda trazabilidad; eliminación limitada a registros sin efectos y reversión auditable son reglas del proyecto. |
| 10 | El traslado registra salida, saldo en tránsito y recepción en destino. | Traslados e Inventario | I01 respalda el movimiento logístico; momentos de afectación y saldo en tránsito son especificación propia. |
| 11 | El pago salarial se relaciona con una cuenta financiera. | Nómina y Caja y bancos | I09/I19 respaldan planilla/cálculo; la cuenta de salida es una decisión de integración del proyecto. |
| 12 | El recibo actual se identifica como comprobante interno. | Ventas y Caja | I10/I23; no se declara certificación ni integración FEL. |
| 13 | Los reportes muestran margen estimado, no utilidad o rentabilidad neta. | Reportes y Dashboard | Adaptación del alcance del indicador a los costos disponibles; no implica calcular todos los gastos. |
| 14 | La venta fraccionada utiliza factores de conversión cuando proceda. | Unidades, Medicamentos, Inventario y Ventas | I17 respalda conversión; no autoriza fraccionamiento de cualquier medicamento. |

### 4.1. Criterio para cantidades de inventario

La existencia física es la cantidad realmente presente en una ubicación. Incluye cantidades que no están disponibles para venta. La cuarentena es un motivo/estado de bloqueo: no debe restarse otra vez si ya forma parte de la cantidad bloqueada.

La disponibilidad se determina sobre stock apto y no reservado. Si una reserva pasa a bloqueo, debe resolverse o reclasificarse para evitar descontarla dos veces. El tránsito se registra como una ubicación o saldo logístico separado: no permanece como stock físico del origen ni entra como stock físico/disponible del destino hasta la recepción.

No presentar física, reservada, bloqueada y cuarentena como cantidades independientes que se suman entre sí sin definir sus relaciones. Este criterio precisa el diseño de la matriz; debe mantenerse coherente con la implementación.

### 4.2. Políticas internas que siguen siendo propias

Son políticas del proyecto: quién autoriza cada operación, los nombres de estados, el circuito exacto de liberación, el bloqueo de pago por validación sanitaria, la prevención de duplicaciones y la forma de calcular disponibilidad. El insumo fundamenta el proceso general; no demuestra esa misma implementación en una empresa real.

### 4.3. Precisiones todavía pendientes o ampliaciones opcionales

Los ajustes declarados no permiten dar por terminados los siguientes puntos:

- **Precisar si corresponde:** conteos físicos y conciliación de diferencias; recepción parcial y faltantes/sobrantes de traslado; aprobación de nómina; conciliación bancaria; fórmula exacta del margen estimado.
- **Ampliaciones opcionales:** depreciación y mantenimiento de activos, exportación IGSS y seguimiento del motorista.

No incorporar módulos adicionales solo porque aparecen en una fuente. Tampoco afirmar que estos puntos están implementados sin verificarlos.

## 5. Catálogo de fuentes y ubicación de evidencia

Todos los enlaces siguientes corresponden a fuentes reales. C y D señalan contenido examinado y documentación localizada en extractos públicos, respectivamente. En D no se afirma haber revisado toda la página; conviene abrirla manualmente antes de adjuntarla como anexo completo. Los textos de páginas Odoo no pudieron recuperarse íntegramente en esta consulta, salvo I12 e I14.

| ID | Autor / título / fecha o versión | Parte útil | Tipo y consulta |
| --- | --- | --- | --- |
| I01 | Hugo Leonel Alvarado Chávez, USAC. [Logística de abastecimiento para una cadena de farmacias](https://biblio.ingenieria.usac.edu.gt/tesis/T11500.pdf), mayo 2013. | Capítulo 2, §2.4.3 y §2.4.3.3; páginas impresas 47–56. Distinguir capítulos propositivos. | Estudio de Batres, C. |
| I02 | Farmacias Galeno. [Carta diciembre 2015](https://6914984.fs1.hubspotusercontent-na1.net/hubfs/6914984/Cartas_API/FARMACIAS_GALENOgt15fgl20_ES.pdf). | Una página: reposición, bodega, devoluciones e indicadores. | Carta empresarial histórica, C. |
| I03 | Farmacias Galeno. [Carta diciembre 2016](https://6914984.fs1.hubspotusercontent-na1.net/hubfs/6914984/Cartas_API/FARMACIAS_GALENO3gt16fgl22_ES.pdf). | Una página: mostrador, Call Center, cobros y reparto. | Carta empresarial histórica, C. |
| I04 | Farmacias Galeno. [Carta septiembre 2018](https://londoncg.com/hubfs/Cartas_API/FARMACIAS_GALENO_5gt18fgl24_ES.pdf). | Una página: recepción/conciliación, despacho y proveedores. | Carta empresarial histórica, C. |
| I05 | OMS. [TRS 1025, Annex 7: Good storage and distribution practices for medical products](https://www.who.int/publications/m/item/trs-1025-annex-7), 2020. | §§9, 12, 13, 17 y 18; PDF enlazado en la publicación. | Guía técnica, C. |
| I06 | MSPAS / DRCPFA. [Formularios de establecimientos](https://medicamentos.mspas.gob.gt/index.php/formularios/establecimientos). | F-AS-f-01 v12-2025, F-AS-c-01 v6-2024, F-AS-f-02 v07-2025. | Índice oficial y versiones examinados; archivos descargables no recuperados íntegramente. |
| I07 | MSPAS / DRCPFA. [Modificación y ampliación de la licencia](https://medicamentos.mspas.gob.gt/index.php/servicios/autorizacion-de-establecimientos-farmaceuticos-y-afines/modificacion-y-ampliacion-de-la-licencia). | Cambios de datos del establecimiento y director técnico. | Procedimiento institucional, C. |
| I08 | MSPAS. [Consulta de registros sanitarios](https://regsanitario.mspas.gob.gt/reg_sanitario/Vigentes.php). | Encabezados y estructura de registros; confirmar cada producto en consulta vigente. | Registro público, C. |
| I09 | IGSS. [Manual de formato para generar archivo de planilla desde sistema propio, v2.2.0](https://servicios.igssgt.org/Descargas/Planilla/GenerarArchivoPlanilla_2.2.0.pdf). | Páginas PDF 3–6 y 8–11: patrono, centros, empleados y liquidaciones. | Manual institucional, C. |
| I10 | Odoo. [Workflow — Point of Sale, 19.0](https://www.odoo.com/documentation/19.0/applications/sales/point_of_sale/use.html). | Configuración, opening/closing register, cash-in/cash-out. | Referencia de software, D. |
| I11 | Odoo. [Manage vendor bills, 19.0](https://www.odoo.com/documentation/19.0/applications/inventory_and_mrp/purchase/manage_deals/manage.html). | Bill control y 3-way matching. | Referencia de software, D. |
| I12 | Odoo. [Bank reconciliation, fuente oficial 19.0](https://github.com/odoo/documentation/blob/19.0/content/applications/finance/accounting/bank/reconciliation.rst). | Reconcile transactions. | Referencia de software, C. |
| I13 | Microsoft. [Manage fixed assets — Business Central](https://learn.microsoft.com/en-gb/dynamics365/business-central/fa-manage), actualización 17 junio 2026. | Register fixed assets, lifecycle y transfer/dispose. | Referencia de software, C. |
| I14 | Odoo. [Access rights, fuente oficial 19.0](https://github.com/odoo/documentation/blob/19.0/content/applications/general/users/access_rights.rst). | Manage roles, groups y record rules. | Referencia de software, C. |
| I15 | OWASP. [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html). | Least privileges, permissions on every request, object-level checks. | Guía técnica, C. |
| I16 | OWASP. [Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html). | Purpose, event attributes y protección de registros. | Guía técnica, C. |
| I17 | Odoo. [Units of measure, 19.0](https://www.odoo.com/documentation/19.0/applications/inventory_and_mrp/inventory/product_management/configure/uom.html). | Conversión de unidades de compra/venta. | Referencia de software, D. |
| I18 | Odoo. [Import vendor pricelist, 19.0](https://www.odoo.com/documentation/19.0/applications/inventory_and_mrp/purchase/products/pricelist.html). | Asociación producto-proveedor; complementar con RFQ si se agregan plazos. | Referencia de software, D. |
| I19 | Odoo. [Salary rules, 19.0](https://www.odoo.com/documentation/19.0/applications/hr/payroll/salary_rules.html). | Reglas/categorías y salario neto. | Referencia de software, D. |
| I20 | Odoo. [Employees, 19.0](https://www.odoo.com/documentation/19.0/applications/hr/employees.html). | Expedientes de empleados y contratos. | Referencia de software, D. |
| I21 | Odoo. [Reporting — POS, 19.0](https://www.odoo.com/documentation/19.0/applications/sales/point_of_sale/reporting.html). | Estadísticas, filtros/agrupación y reporte de sesión. | Referencia de software, D. |
| I22 | Odoo. [Build and customize dashboards, 19.0](https://www.odoo.com/documentation/19.0/applications/productivity/dashboards/build_and_customize_dashboards.html). | Selección de datos y visualización. | Referencia de software, D. |
| I23 | SAT. [Factura Electrónica en Línea — portal oficial](https://en.portal.sat.gob.gt/portal/efactura/). | Emisión, transmisión, certificación y conservación. | Información institucional, D; no se verifica integración ni reglas fiscales detalladas. |
| I24 | Farmacias Galeno. [Sitio oficial](https://www.farmaciasgaleno.com.gt/). | Búsqueda por laboratorio/producto/componente y número/estado de orden. | Canal empresarial público, C. |

Fuente complementaria: [IGSS — Planilla Electrónica](https://www.igssgt.org/servicios-electronicos/planilla-electronica/), proceso de presentación y pago; página examinada.

## 6. Cómo utilizarlos en el trabajo académico

Para cada proceso conserva una ficha con:

1. Identificador del insumo y enlace.
2. Autor, título, fecha/versión y fecha de consulta.
3. Sección o página que respalda el proceso.
4. Síntesis breve de la evidencia.
5. Módulo y requisito del sistema relacionado.
6. Adaptación del proyecto y sus límites.

Ejemplo de redacción metodológica:

“El sistema propuesto para una cadena ficticia de farmacias se fundamenta en investigación documental de operaciones empresariales, fuentes institucionales y documentación de sistemas existentes. Se distingue el proceso respaldado por cada fuente de las reglas funcionales adoptadas en el diseño académico.”

No afirmar que se entrevistó a trabajadores ni que se accedió a documentos internos. No presentar las propuestas de una tesis como procedimientos ya implantados. No utilizar un porcentaje de concordancia como medición formal: el respaldo es por requisito y evidencia.

## 7. Resultado

Se encontró respaldo documental directo o de referencia para las 31 áreas funcionales concretas. La fuerza del respaldo varía: logística y controles de almacenamiento tienen fuentes farmacéuticas; caja, activos y algunos catálogos tienen referencias de software empresarial; menús y estados son adaptaciones de diseño. Esto justifica investigar y conservar los módulos, no valida automáticamente cada regla o implementación.

No hace falta reemplazar la farmacia ficticia por Galeno o Batres. Los ajustes declarados quedan incorporados a la relación fuente–módulo y se distinguen de las precisiones pendientes. Se conservan las 31 áreas y el catálogo de 24 fuentes. La correspondencia es documental, no una certificación de implementación.

