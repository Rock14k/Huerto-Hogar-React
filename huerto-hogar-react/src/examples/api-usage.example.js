/**
 * Ejemplos de uso del servicio API para conectar con el backend Spring Boot
 * 
 * Este archivo contiene ejemplos de cómo usar el servicio API en diferentes escenarios.
 * Puedes usar estos ejemplos como referencia al integrar el backend en tus componentes.
 */

import apiService from '../services/api.service';
import { useAuth } from '../context/AuthContext';

// ============================================
// EJEMPLO 1: Obtener productos del backend
// ============================================
export const fetchProductsExample = async () => {
  try {
    // GET request simple
    const products = await apiService.get('/products');
    console.log('Productos:', products);
    return products;
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    throw error;
  }
};

// ============================================
// EJEMPLO 2: Obtener un producto por ID
// ============================================
export const fetchProductByIdExample = async (productId) => {
  try {
    const product = await apiService.get(`/products/${productId}`);
    return product;
  } catch (error) {
    if (error.status === 404) {
      console.error('Producto no encontrado');
    }
    throw error;
  }
};

// ============================================
// EJEMPLO 3: Crear una orden (checkout)
// ============================================
export const createOrderExample = async (orderData) => {
  try {
    const order = await apiService.post('/orders', {
      items: orderData.items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      customer: {
        name: orderData.customer.name,
        email: orderData.customer.email,
        phone: orderData.customer.phone,
        address: orderData.customer.address
      },
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      discount: orderData.discount,
      total: orderData.total,
      paymentMethod: orderData.paymentMethod
    });
    
    console.log('Orden creada:', order);
    return order;
  } catch (error) {
    console.error('Error creando orden:', error);
    throw error;
  }
};

// ============================================
// EJEMPLO 4: Actualizar perfil de usuario
// ============================================
export const updateUserProfileExample = async (userId, profileData) => {
  try {
    const updatedUser = await apiService.put(`/users/${userId}`, {
      displayName: profileData.displayName,
      phone: profileData.phone,
      address: profileData.address
    });
    return updatedUser;
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    throw error;
  }
};

// ============================================
// EJEMPLO 5: Componente React con hooks
// ============================================
import React, { useState, useEffect } from 'react';

export const ProductsListExample = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.get('/products');
      setProducts(data);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) {
      return;
    }

    try {
      await apiService.delete(`/products/${productId}`);
      // Recargar la lista
      loadProducts();
    } catch (err) {
      alert('Error al eliminar el producto: ' + err.message);
    }
  };

  if (loading) {
    return <div>Cargando productos...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={loadProducts}>Reintentar</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Lista de Productos</h2>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>Precio: ${product.price}</p>
          {currentUser?.role === 'admin' && (
            <button onClick={() => handleDelete(product.id)}>
              Eliminar
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

// ============================================
// EJEMPLO 6: Formulario para crear/editar producto
// ============================================
export const ProductFormExample = ({ productId, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    stock: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      const product = await apiService.get(`/products/${productId}`);
      setFormData({
        name: product.name || '',
        price: product.price || '',
        description: product.description || '',
        category: product.category || '',
        stock: product.stock || ''
      });
    } catch (error) {
      console.error('Error cargando producto:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (productId) {
        // Actualizar producto existente
        await apiService.put(`/products/${productId}`, {
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        });
        alert('Producto actualizado exitosamente');
      } else {
        // Crear nuevo producto
        await apiService.post('/products', {
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        });
        alert('Producto creado exitosamente');
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nombre"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="Precio"
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        required
      />
      <textarea
        placeholder="Descripción"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
      <input
        type="text"
        placeholder="Categoría"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
      />
      <input
        type="number"
        placeholder="Stock"
        value={formData.stock}
        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : productId ? 'Actualizar' : 'Crear'}
      </button>
    </form>
  );
};

// ============================================
// EJEMPLO 7: Manejo avanzado de errores
// ============================================
export const advancedErrorHandlingExample = async () => {
  try {
    const data = await apiService.get('/products');
    return { success: true, data };
  } catch (error) {
    // Manejar diferentes tipos de errores
    switch (error.status) {
      case 401:
        // No autorizado - redirigir a login
        console.error('No autorizado - redirigir a login');
        // navigate('/iniciar-sesion');
        break;
      
      case 403:
        // Prohibido - no tienes permisos
        console.error('No tienes permisos para realizar esta acción');
        break;
      
      case 404:
        // No encontrado
        console.error('Recurso no encontrado');
        break;
      
      case 422:
        // Error de validación
        console.error('Error de validación:', error.data);
        break;
      
      case 500:
      case 502:
      case 503:
        // Error del servidor
        console.error('Error del servidor. Por favor intenta más tarde');
        break;
      
      default:
        console.error('Error desconocido:', error.message);
    }
    
    return { success: false, error };
  }
};

// ============================================
// EJEMPLO 8: Upload de imagen de producto
// ============================================
export const uploadProductImageExample = async (productId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('productId', productId);

    const result = await apiService.uploadFile(`/products/${productId}/image`, formData);
    console.log('Imagen subida:', result);
    return result;
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    throw error;
  }
};

