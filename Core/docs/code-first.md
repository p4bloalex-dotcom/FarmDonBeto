# Code First Puro

Este flujo separa las migraciones legacy de las migraciones generadas desde entidades.

## Requisito

Use un usuario/esquema Oracle limpio para Code First. No use el esquema legacy actual, porque contiene constraints/defaults/identity generados por migraciones manuales y TypeORM generara diffs falsos.

## Comandos

```bash
npm run codefirst:add --name=InitialSchema
npm run codefirst:update
```

Despues de aplicar la migracion inicial, los siguientes cambios se hacen igual:

```bash
npm run codefirst:add --name=FKUsuario
npm run codefirst:update
```

## Proteccion

Los comandos bloquean esquemas con tablas existentes que no tengan historial `MIGRATIONS_CODE_FIRST`.

Para forzar bajo responsabilidad propia:

```bash
CODE_FIRST_ALLOW_DIRTY_SCHEMA=true npm run codefirst:add --name=MiCambio
```

## Migracion de datos

1. Crear usuario/esquema Oracle nuevo.
2. Configurar `.env` con ese usuario.
3. Generar y aplicar `InitialSchema`.
4. Copiar datos desde el esquema legacy al nuevo con scripts ETL controlados.
5. Usar solo `codefirst:add` y `codefirst:update` hacia adelante.
