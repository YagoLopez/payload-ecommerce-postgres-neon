# AGENTS.md

## Comandos de configuración
- Instalar dependencias: `pnpm install`
- Iniciar servidor de desarrollo: `pnpm dev`
- Ejecutar pruebas: `pnpm test`

## Estilo de código
- Modo estricto de TypeScript
- Usar ESLint y Prettier para la consistencia del código.
- Seguir los principios de Clean Architecture y SOLID.

## Instrucciones de prueba
- Ejecutar pruebas unitarias: `pnpm test:int`
- Ejecutar pruebas E2E: `pnpm test:e2E`
- Ejecutar todas las pruebas: `pnpm test`
- Corregir cualquier error de prueba o de tipo hasta que todo el conjunto de pruebas esté en verde.
- Añadir o actualizar pruebas para el código que cambies, aunque nadie lo haya pedido.

## Instrucciones para PRs
- Siempre ejecutar `pnpm lint` y `pnpm test` antes de hacer commit.
- Seguir los estándares de commits convencionales para los mensajes de commit.
