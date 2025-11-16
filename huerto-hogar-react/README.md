# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

---

# HuertoHogar (React)

Ecommerce de productos orgánicos para Chile, construido con React + React-Bootstrap. Incluye autenticación con Firebase, formulario de contacto con EmailJS, catálogo de productos, blog, página de perfil, checkout simulado y un historial de compras con exportaciones.

## Tabla de Contenidos
- Descripción General
- Características Clave
- Estructura y Rutas
- Requisitos Previos
- Configuración Rápida (Local)
- Configuración de Firebase Auth
- Configuración de EmailJS (Contacto)
- Uso de la App (Flujos)
- Persistencia Local (mock)
- Despliegue (Firebase Hosting)
- Troubleshooting

## Descripción General
HuertoHogar permite a los usuarios explorar productos orgánicos, iniciar sesión/registrarse (con verificación de correo), contactar a la tienda, simular compras y revisar su historial con herramientas de exportación.

## Características Clave
- Autenticación con Firebase (Email/Password) y verificación de correo.
- Contacto restringido a usuarios verificados (EmailJS con reenvío de verificación).
- Blog estático con enlaces externos y hero compartido.
- Catálogo de productos con carrito lateral y vista de detalle.
- Checkout simulado: dirección de envío, método de pago y notas.
- Historial de compras local por usuario con:
  - Filtros por fecha, búsqueda por ID, orden (fecha/total), paginación.
  - Exportar CSV (orden individual y todas las filtradas) e imprimir/guardar PDF.
  - Estados simulados (Creada/Pagada/Enviada) y eliminación de órdenes.
- **Panel de Administración** con:
  - Autenticación y control de acceso por roles
  - Dashboard con estadísticas y métricas clave
  - Gestión completa de productos (CRUD)
  - Gestión de usuarios y roles
  - Administración de pedidos con seguimiento de estados
  - Filtros avanzados y generación de reportes

## Estructura y Rutas
Componentes principales (carpeta `src/`):
- Layout: `components/layout/Header.js`, `components/layout/Footer.js`
- Auth: `components/auth/LoginForm.js`, `RegisterForm.js`, `ForgotPassword.js`
- Carrito: `components/cart/CartSidebar.js`
- Páginas: `pages/Home.js`, `About.js`, `Products.js`, `ProductDetail.js`, `Contact.js`, `Blog.js`, `Profile.js`, `Checkout.js`, `OrderHistory.js`
- Panel de Administración: 
  - `pages/admin/AdminDashboard.js` - Panel principal con estadísticas
  - `pages/admin/AdminProducts.js` - Gestión de productos (CRUD)
  - `pages/admin/AdminUsers.js` - Gestión de usuarios
  - `pages/admin/AdminOrders.js` - Gestión de pedidos
- Contextos: `context/AuthContext.js`, `context/CartContext.js`
- Firebase: `firebase/config.js`

Rutas (ver `src/App.js`):
- Públicas: `/`, `/nosotros`, `/productos`, `/productos/:id`, `/blog`, `/contacto`, `/iniciar-sesion`, `/registro`, `/olvide-contrasena`.
- Privadas: `/perfil`, `/carrito` (Checkout), `/historial-compras`.
- **Administración (requiere rol admin)**:
  - `/admin` - Panel de control
  - `/admin/productos` - Gestión de productos
  - `/admin/usuarios` - Gestión de usuarios
  - `/admin/ordenes` - Gestión de pedidos

## Requisitos Previos
- Node 18+ y npm.
- Cuenta de Firebase con proyecto Web configurado.

## Configuración Rápida (Local)
1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar en desarrollo:
   ```bash
   npm start
   ```
3. Abrir: http://localhost:3000

## Panel de Administración

### Acceso al Panel
- Solo usuarios con rol de administrador pueden acceder a las rutas de administración.
- Cuentas de administrador predefinidas (pueden modificarse en `src/context/AuthContext.js`):
  - admin@huertohogar.com
  - administrador@huertohogar.com
  - soporte@huertohogar.com
  - jefe.ventas@huertohogar.com

### Características Principales

#### Dashboard Principal (`/admin`)
- Resumen de métricas clave (productos, usuarios, pedidos, ingresos)
- Gráficos interactivos de ventas y crecimiento de usuarios
- Vista de pedidos recientes
- Filtros avanzados por fechas

#### Gestión de Productos (`/admin/productos`)
- Listado completo de productos con búsqueda y filtros
- Crear, editar y eliminar productos
- Vista previa de imágenes
- Validación de formularios

#### Gestión de Usuarios (`/admin/usuarios`)
- Listado de usuarios registrados
- Edición de perfiles y roles
- Eliminación de usuarios (excepto el propio administrador)
- Filtros y búsqueda

#### Gestión de Pedidos (`/admin/ordenes`)
- Vista completa de todos los pedidos
- Filtros avanzados por estado, fechas y búsqueda
- Actualización de estados de pedidos
- Exportación de datos

### Reportes
- Generación de reportes personalizados
- Exportación en múltiples formatos (PDF, Excel, CSV)
- Métricas de rendimiento y conversión

### Configuración de Firebase Auth
Archivo: `src/firebase/config.js`
```js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "<API_KEY>",
  authDomain: "<PROJECT_ID>.firebaseapp.com",
  projectId: "<PROJECT_ID>",
  storageBucket: "<PROJECT_ID>.firebasestorage.app",
  messagingSenderId: "<SENDER_ID>",
  appId: "<APP_ID>",
  measurementId: "<MEASUREMENT_ID>"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```
En Firebase Console → Authentication:
- “Sign-in method” → habilitar “Email/Password”.
- “Settings” → “Authorized domains”: agregar `localhost`, `127.0.0.1`, y (si aplica) tus dominios de Hosting.

## Configuración de EmailJS (Contacto)
- Carga por CDN (ya integrado en `src/pages/Contact.js`).
- Reemplaza con tu `publicKey`, `serviceId`, `templateId` si cambian.
- El formulario requiere usuario autenticado y correo verificado.

## Uso de la App (Flujos)
1. Registro → envía verificación → Login.
2. Header muestra banner si el email no está verificado y permite reenviar verificación.
3. Contacto: sólo usuarios verificados pueden enviar (EmailJS).
4. Carrito: lateral desde el header; “Finalizar compra” → `/checkout`.
5. Checkout simulado:
   - Dirección: precargada desde `localStorage('user_profile_extra')` y editable.
   - Pago: Tarjeta/Transferencia/Contraentrega.
   - Confirmar → crea orden local con `shippingAddress`, `paymentMethod`, `notes`.
6. Historial de compras (`/historial-compras`):
   - Filtros, búsqueda por ID, orden (fecha/total), paginación.
   - Exportar CSV (todo filtrado o una orden) e imprimir PDF.
   - Editar estado (Creada/Pagada/Enviada) y eliminar.

## Persistencia Local (mock)
- Órdenes: `localStorage` por usuario: `orders_<uid>`.
- Perfil extra (no sensible): `user_profile_extra`.
Nota: al integrar Firestore, estas claves pueden migrarse a colecciones reales.

## Despliegue (Firebase Hosting)
`firebase.json` recomendado para React SPA:
```json
{
  "hosting": {
    "site": "tienda-huertohogar",
    "public": "build",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```
Pasos:
1. `npm run build`
2. `firebase deploy --only hosting`

## Troubleshooting
- `auth/api-key-not-valid`: revisa `src/firebase/config.js` con las credenciales correctas del proyecto actual.
- `auth/operation-not-allowed`: habilita Email/Password en “Sign-in method”.
- Dominio no autorizado: agrega `localhost`/`127.0.0.1` o tu dominio en “Authorized domains”.
- EmailJS no envía: revisa `publicKey/serviceId/templateId` y conexión.
- Vulnerabilidades npm: ejecuta `npm audit`, `npm audit fix` (y con cuidado `--force`).

## Scripts útiles
- Desarrollo: `npm start`
- Build prod: `npm run build`
- Tests: `npm test`

## Créditos
- UI basada en React-Bootstrap.
- Autenticación: Firebase Auth.
- Contacto: EmailJS.

---

## Herramientas y Stack
- React 18 + React Router.
- React-Bootstrap para UI.
- Firebase Auth (cliente) para login/registro/verificación.
- EmailJS para formulario de contacto (CDN sin backend propio).
- LocalStorage para persistencia mock de órdenes y perfil extra.
- i18n: i18next + react-i18next.

## Funcionalidades Implementadas
- Autenticación (registro, login, logout) con verificación de correo y reenvío.
- Páginas: Home, Nosotros, Productos, Detalle, Blog, Contacto, Perfil, Checkout, Historial de compras.
- Carrito lateral con cantidades, totales, vaciar y seguir comprando.
- Checkout simulado con dirección, método de pago y notas.
- Historial con filtros, búsqueda, orden, paginación, exportaciones CSV/PDF, cambio de estado y eliminación.
- Internacionalización ES/EN/FR con selector en el header.

## Procesos de Desarrollo (recomendados)
- Convenciones de commits: tipo(scope): mensaje (feat, fix, docs, style, refactor).
- Ramas: main (estable), feat/* para nuevas funciones, fix/* para correcciones.
- PRs pequeños y revisiones con checklist (UI, accesibilidad, errores consola, i18n).

## Internacionalización (i18n)
Archivos:
- `src/i18n.js` inicializa i18next y carga resources.
- `src/locales/es/common.json`, `src/locales/en/common.json`, `src/locales/fr/common.json`.
- `src/components/layout/Header.js` incluye selector de idioma y textos traducidos.

Instalación dependencias (elige UNA opción):
- Opción A (compatibles con TypeScript 4.x):
  ```bash
  npm install i18next@22 react-i18next@12
  ```
- Opción B (últimas versiones, ignorando peer opcional de TS):
  ```bash
  npm install i18next react-i18next --legacy-peer-deps
  ```

Uso básico en componentes:
```jsx
import { useTranslation } from 'react-i18next';
const { t, i18n } = useTranslation();
return <h1>{t('nav.products')}</h1>;
```

Persistencia del idioma: se guarda en `localStorage('lang')` y se restaura al cargar.

## Modelo de Datos (mock)
- `orders_<uid>`: array de órdenes `{ id, items[], total, count, createdAt, status, paymentMethod?, shippingAddress?, notes? }`.
- `user_profile_extra`: datos no sensibles para precargar dirección.

## Seguridad y Privacidad
- La API key de Firebase es pública por diseño (solo identifica el proyecto). Control real en reglas/console.
- Verificación de correo obligatoria para acciones sensibles (Contact).
- Sin datos sensibles en localStorage.

## Guía Rápida de Uso
- Registro → Verificación (email) → Login.
- Cambia idioma en el header (ES/EN/FR).
- Agrega productos al carrito → Checkout → Confirmar.
- Consulta tus compras en Historial (filtros, exportar CSV, imprimir PDF, cambiar estado, eliminar).

## Problemas Frecuentes
- i18n ERESOLVE por TypeScript:
  - Usa `npm install i18next@22 react-i18next@12` o agrega `--legacy-peer-deps`.
- `auth/operation-not-allowed`:
  - Habilita Email/Password en Firebase Console.
- `auth/domain-not-allowed`:
  - Agrega `localhost` y `127.0.0.1` en Authorized domains.
