# Servicio de API

Este directorio contiene el servicio para comunicarse con el backend Spring Boot.

## Configuración

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con la siguiente configuración:

```env
REACT_APP_API_BASE_URL=http://localhost:8080
```

En producción, cambia la URL por la de tu servidor desplegado:

```env
REACT_APP_API_BASE_URL=https://api.tudominio.com
```

### Configuración CORS del Backend

Asegúrate de que el backend esté configurado para aceptar peticiones desde tu frontend. En el archivo `application.properties` o `application.yml` del backend:

```properties
frontend.allowed-origins=http://localhost:3000,http://localhost:3001
```

O para producción:

```properties
frontend.allowed-origins=https://tudominio.com
```

## Uso del Servicio

### Importar el servicio

```javascript
import apiService from '../services/api.service';
```

### Ejemplos de uso

#### GET - Obtener recursos

```javascript
// Obtener todos los productos
const products = await apiService.get('/products');

// Obtener un producto por ID
const product = await apiService.get('/products/1');

// Con parámetros de consulta
const filteredProducts = await apiService.get('/products?category=vegetables');
```

#### POST - Crear recursos

```javascript
// Crear un nuevo producto
const newProduct = await apiService.post('/products', {
  name: 'Tomate',
  price: 2500,
  category: 'vegetables',
  stock: 100
});

// Crear una orden
const order = await apiService.post('/orders', {
  items: [
    { productId: 1, quantity: 2 },
    { productId: 2, quantity: 1 }
  ],
  shippingAddress: {
    street: 'Av. Principal 123',
    city: 'Santiago',
    region: 'Región Metropolitana'
  }
});
```

#### PUT - Actualizar recursos

```javascript
// Actualizar un producto completo
const updatedProduct = await apiService.put('/products/1', {
  name: 'Tomate Orgánico',
  price: 2800,
  category: 'vegetables',
  stock: 150
});
```

#### PATCH - Actualización parcial

```javascript
// Actualizar solo el stock
const updatedStock = await apiService.patch('/products/1', {
  stock: 200
});
```

#### DELETE - Eliminar recursos

```javascript
// Eliminar un producto
await apiService.delete('/products/1');
```

#### Upload de archivos

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('productId', '1');

const uploadResult = await apiService.uploadFile('/products/1/image', formData);
```

### Manejo de errores

```javascript
try {
  const data = await apiService.get('/products');
  console.log('Productos:', data);
} catch (error) {
  console.error('Error:', error.message);
  console.error('Status:', error.status);
  console.error('Datos del error:', error.data);
  
  // Manejar diferentes tipos de errores
  if (error.status === 401) {
    // No autorizado - redirigir a login
    navigate('/iniciar-sesion');
  } else if (error.status === 404) {
    // Recurso no encontrado
    alert('El recurso solicitado no existe');
  } else if (error.status >= 500) {
    // Error del servidor
    alert('Error del servidor. Por favor intenta más tarde');
  }
}
```

### Autenticación

El servicio maneja automáticamente la autenticación. Cuando un usuario está autenticado con Firebase, el token se incluye automáticamente en el header `Authorization` como `Bearer <token>`.

Si necesitas hacer una petición sin autenticación, puedes hacerlo directamente con `fetch` o crear un método personalizado.

### Headers personalizados

```javascript
// Agregar headers personalizados
const data = await apiService.get('/products', {
  headers: {
    'X-Custom-Header': 'valor'
  }
});
```

## Integración en Componentes React

```javascript
import React, { useState, useEffect } from 'react';
import apiService from '../services/api.service';

function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await apiService.get('/products');
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error cargando productos:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}

export default ProductsList;
```

