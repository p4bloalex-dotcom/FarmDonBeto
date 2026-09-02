# Core

Backend Node.js para la capa transversal de la aplicacion: autenticacion, autorizacion, seguridad, roles, menus, permisos y auditoria. Esta carpeta reemplaza la referencia .NET de `CoreReferencia` usando Express y Oracle XE.

## Requisitos

- Node.js 20 o superior.
- Oracle XE disponible, usualmente `localhost:1521/XEPDB1`.
- Usuario/esquema Oracle creado para la app.

## Inicio

1. Copiar `.env.example` a `.env` y ajustar credenciales.
2. Instalar dependencias con `npm install`.
3. Ejecutar migraciones code-first con `npm run migration:run`.
4. Activar `RUN_SEEDERS=true` para generar automaticamente menus y permisos desde las rutas/controladores registrados.
5. Iniciar con `npm run dev`.

## Alcance Actual

- Incluye rutas de autenticacion y administracion de seguridad.
- No incluye controladores de negocio como catalogos, operaciones, reportes o configuraciones especificas.
- Usa TypeORM como ORM. Las entidades estan en `src/entities` y las migraciones en `src/migrations`.
- La validacion de permisos se realiza con el middleware `permissionRequired`, apoyado en `SP_VALIDATE_USER_ACCESS`.
- Los menus y permisos se generan automaticamente desde metadata de rutas con `registerControllerRoute`.
- El nombre de permiso sigue el patron de la referencia: `Controlador.Accion`, por ejemplo `Role.Crear`.

## Como Registrar Nuevos Controladores

Para que una pantalla/controlador genere menu y permisos automaticamente, registre su metadata una sola vez en el archivo de rutas:

```js
const permissions = registerScreen({
  category: 'Catalog',
  controller: 'Product',
  title: 'Productos',
  icon: 'heroicons_solid:cube',
  actions: crudActions()
});

router.post('/', permissionRequired(permissions.create), handler);
```

Con `RUN_SEEDERS=true`, el backend crea:

- Menu padre por `category`.
- Menu hijo por `controller`.
- Permiso por `controller.action`, por ejemplo `Product.Crear`.

Para el CMS, use `GET /api/security/permissions/screens`. Devuelve las pantallas con sus permisos agrupados para mostrar una pantalla y activar/desactivar sus acciones sin armar nombres manualmente.
