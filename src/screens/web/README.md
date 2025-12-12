## Rifas Web (Next.js)

Version web de respaldo para la app de rifas. Incluye landing, login, catálogo de rifas, panel admin y estado del sistema.

### Requisitos
- Node.js 18+
- npm

### Variables de entorno
Crea `.env.local` (o usa `.env.example`) con:

```
NEXT_PUBLIC_API_BASE_URL=https://tu-backend.example.com
```

Si no defines `NEXT_PUBLIC_API_BASE_URL`, la app usa datos mock para probar UI.

### Comandos
- `npm install`
- `npm run dev`
- `npm run lint`
- `npm run build`

### Rutas clave
- `/` landing con CTA a login/rifas/admin/estado.
- `/login` formulario email/teléfono + contraseña (token demo si falta backend).
- `/rifas` listado con precio, disponibilidad y CTA.
- `/admin` atajos para crear rifas, pagos, validación y reportes.
- `/estado` salud de servicios (API, pagos, validaciones).

### Nota sobre lockfiles
Hay lockfiles en niveles superiores; Next.js puede emitir un warning. Si quieres silenciarlo, elimina lockfiles sobrantes o ajusta `turbopack.root` en `next.config.ts`.
