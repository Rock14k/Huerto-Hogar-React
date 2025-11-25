# Configuración de Conexión con el Backend Spring Boot

Este documento explica cómo configurar la conexión entre el frontend React y el backend Spring Boot.

## Requisitos Previos

- Backend Spring Boot ejecutándose (por defecto en `http://localhost:8080`)
- Configuración CORS del backend permitiendo el origen del frontend

## Configuración del Frontend

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto (`huerto-hogar-react/.env.local`) con el siguiente contenido:

```env
REACT_APP_API_BASE_URL=http://localhost:8080
```

**Nota:** En React, las variables de entorno deben comenzar con `REACT_APP_` para ser accesibles en el código.

### 2. Para Producción

Si vas a desplegar la aplicación en producción, actualiza la URL en `.env.local` o crea un `.env.production`:

```env
REACT_APP_API_BASE_URL=https://api.tudominio.com
```

### 3. Reiniciar el Servidor de Desarrollo

Después de crear o modificar el archivo `.env.local`, debes reiniciar el servidor de desarrollo:

```bash
npm start
```

## Configuración del Backend

### 1. Configurar CORS

Asegúrate de que tu backend Spring Boot esté configurado para aceptar peticiones desde tu frontend. 

En tu archivo `application.properties` o `application.yml`:

**application.properties:**
```properties
# Desarrollo
frontend.allowed-origins=http://localhost:3000,http://localhost:3001

# Producción (agregar la URL de producción)
# frontend.allowed-origins=https://tudominio.com,http://localhost:3000
```

**application.yml:**
```yaml
frontend:
  allowed-origins: "http://localhost:3000,http://localhost:3001"
```

### 2. Verificar la Configuración CORS

Tu `CorsConfig.java` ya está configurado correctamente. Solo asegúrate de que:

1. El mapeo sea `/api/**` (coincide con lo que usa el servicio)
2. Los métodos permitidos incluyan: GET, POST, PUT, DELETE, OPTIONS
3. Los headers permitidos incluyan: Content-Type, Authorization
4. `allowCredentials` esté en `true`

## Estructura de Archivos Creados

```
huerto-hogar-react/
├── .env.local                    # Variables de entorno (crear manualmente)
├── src/
│   ├── config/
│   │   └── api.config.js        # Configuración de la API
│   └── services/
│       ├── api.service.js       # Servicio HTTP para el backend
│       └── README.md            # Documentación del servicio
└── CONFIGURACION_BACKEND.md     # Este archivo
```

## Uso del Servicio API

### Importar el servicio

```javascript
import apiService from '../services/api.service';
```

### Ejemplo básico

```javascript
// Obtener productos
const products = await apiService.get('/products');

// Crear una orden
const order = await apiService.post('/orders', {
  items: [...],
  customer: {...}
});

// Actualizar producto
await apiService.put('/products/1', { name: 'Nuevo nombre' });

// Eliminar producto
await apiService.delete('/products/1');
```

### Manejo de errores

```javascript
try {
  const data = await apiService.get('/products');
} catch (error) {
  if (error.status === 401) {
    // No autorizado
    navigate('/iniciar-sesion');
  } else {
    console.error('Error:', error.message);
  }
}
```

## Autenticación

El servicio maneja automáticamente la autenticación con Firebase:

- Obtiene el token del usuario autenticado
- Lo incluye en el header `Authorization: Bearer <token>`
- Funciona automáticamente en todas las peticiones

No necesitas configurar nada adicional para la autenticación.

## Verificación de la Conexión

### 1. Verificar que el backend esté corriendo

```bash
curl http://localhost:8080/api/health
```

O visita la URL en el navegador.

### 2. Verificar desde el frontend

Abre la consola del navegador (F12) y prueba:

```javascript
// En la consola del navegador
import apiService from './services/api.service';
apiService.get('/health').then(console.log).catch(console.error);
```

### 3. Ver errores de CORS

Si ves errores de CORS en la consola del navegador:

1. Verifica que la URL del backend sea correcta
2. Verifica que `frontend.allowed-origins` incluya la URL del frontend
3. Verifica que el backend esté aceptando peticiones OPTIONS (preflight)

## Troubleshooting

### Error: Network request failed

- Verifica que el backend esté corriendo
- Verifica que la URL en `.env.local` sea correcta
- Verifica la configuración de firewall

### Error: CORS policy

- Verifica que `frontend.allowed-origins` en el backend incluya la URL del frontend
- Asegúrate de reiniciar el backend después de cambiar la configuración
- Verifica que la configuración CORS permita credenciales (`allowCredentials: true`)

### Error: 401 Unauthorized

- Verifica que el usuario esté autenticado en Firebase
- Verifica que el backend esté configurado para validar tokens de Firebase
- Revisa los logs del backend para más detalles

### Las variables de entorno no funcionan

- Asegúrate de que las variables comiencen con `REACT_APP_`
- Reinicia el servidor de desarrollo después de crear/modificar `.env.local`
- Verifica que el archivo esté en la raíz del proyecto, no en `src/`

## Próximos Pasos

1. Integra el servicio API en tus componentes existentes
2. Reemplaza las llamadas a localStorage con llamadas al backend
3. Implementa sincronización de datos entre frontend y backend
4. Configura el backend para validar tokens de Firebase

