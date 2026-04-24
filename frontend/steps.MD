# Pasos para la Configuración de Paquetes (NPM)

Este documento detalla los comandos necesarios para replicar la configuración actual de dependencias del proyecto Angular 21.

## 1. Inicialización del Proyecto
Si empiezas desde cero, inicializa el `package.json`:
```bash
npm init -y
```

## 2. Instalación de Angular Core y Common
Instala las dependencias fundamentales de Angular (v21):
```bash
npm install @angular/core@^21.2.0 @angular/common@^21.2.0 @angular/compiler@^21.2.0 @angular/platform-browser@^21.2.0 @angular/router@^21.2.0 @angular/forms@^21.2.0
```

## 3. Instalación de RxJS y Librerías de Utilidad
```bash
npm install rxjs@^7.8.1 tslib@^2.8.1 date-fns-tz@^3.2.0
```

## 4. Instalación de Interfaz y UI (Bootstrap & SweetAlert2)
```bash
npm install bootstrap@^5.3.8 bootstrap-icons@^1.13.1 sweetalert2@^11.16.0 @sweetalert2/ngx-sweetalert2@^14.1.3
```

## 5. Instalación de Dependencias de Desarrollo (DevDependencies)
Instala las herramientas de construcción, CLI y testing:
```bash
npm install -D @angular/cli@^21.2.6 @angular/build@^21.2.6 @angular/compiler-cli@^21.2.0 typescript@~5.9.2 vitest@^4.0.8 jsdom@^28.0.0 prettier@^3.8.1 @types/bootstrap@^5.2.10
```

## 6. Verificación Final
Para asegurar que todo esté correctamente instalado según el lockfile:
```bash
npm install
```
