# Pillarboxed

Prototipo web para la comunidad cinéfila de la IU Pascual Bravo. Está construido
con Next.js, TypeScript y Tailwind CSS.

## Desarrollo local

Requisitos: Node.js y npm.

```bash
npm ci
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Comandos disponibles:

```bash
npm run lint
npm run build
npm start
```

## TMDB

La clave de TMDB se solicita desde la sección **API** de la configuración de una
cuenta de [TMDB](https://www.themoviedb.org/settings/api). Crear este repositorio
no genera ni habilita una clave.

Cuando se integre TMDB, guarda la clave en `.env.local` usando la variable
`TMDB_API_KEY`. No uses el prefijo `NEXT_PUBLIC_` ni publiques la clave. Los
archivos `.env*` están excluidos de Git; `.env.example` solo sirve como plantilla.

La integración de TMDB mediante un Route Handler aún está pendiente en este
prototipo.

## Alcance actual

La aplicación presenta páginas públicas de inicio, ayuda, preguntas frecuentes,
membresía informativa, términos y privacidad, además del formulario de solicitud
de acceso. El inicio de sesión, el registro y los pagos son simulados; no se
realizan cobros. Las solicitudes de acceso se guardan en el almacenamiento local
del navegador.
