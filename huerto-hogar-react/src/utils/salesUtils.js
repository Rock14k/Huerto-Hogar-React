// Utility functions for sales operations

// Get all sales
export const getAllSales = () => {
  try {
    return JSON.parse(localStorage.getItem('sales') || '[]');
  } catch (error) {
    console.error('Error getting sales:', error);
    return [];
  }
};

// Get filtered sales
export const getFilteredSales = (filters = {}) => {
  try {
    let sales = getAllSales();
    const { startDate, endDate, searchTerm = '' } = filters;
    const searchLower = searchTerm.toLowerCase();

    return sales.filter(sale => {
      // Filter by date range
      if (startDate && endDate) {
        const saleDate = new Date(sale.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        if (saleDate < start || saleDate > end) return false;
      }

      // Filter by search term
      if (searchTerm) {
        return (
          sale.orderId.toLowerCase().includes(searchLower) ||
          (sale.customer?.name?.toLowerCase().includes(searchLower) || '').includes(searchLower) ||
          (sale.customer?.email?.toLowerCase().includes(searchLower) || '').includes(searchLower)
        );
      }

      return true;
    });
  } catch (error) {
    console.error('Error filtering sales:', error);
    return [];
  }
};

export const recordSale = (order) => {
  try {
    const sales = JSON.parse(localStorage.getItem('sales') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    // Create sale record
    const saleRecord = {
      id: `sale_${Date.now()}`,
      orderId: order.id,
      customer: order.customer || {},
      items: order.items.map(item => ({
        ...item,
        productName: products.find(p => p.id === item.productId)?.name || 'Producto no encontrado'
      })),
      total: order.total || 0,
      date: new Date().toISOString(),
      status: 'completed',
      paymentMethod: order.paymentMethod || 'No especificado'
    };

    // Update products' sales count
    const updatedProducts = products.map(product => {
      const orderItem = order.items.find(item => item.productId === product.id);
      if (orderItem) {
        return {
          ...product,
          purchaseCount: (product.purchaseCount || 0) + orderItem.quantity,
          stock: Math.max(0, (product.stock || 0) - orderItem.quantity),
          lastSold: new Date().toISOString()
        };
      }
      return product;
    });

    // Save to localStorage
    localStorage.setItem('sales', JSON.stringify([...sales, saleRecord]));
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    
    return true;
  } catch (error) {
    console.error('Error recording sale:', error);
    return false;
  }
};

export const getSalesReport = (startDate, endDate) => {
  try {
    const sales = JSON.parse(localStorage.getItem('sales') || '[]');
    
    // Filter by date range if provided
    let filteredSales = [...sales];
    if (startDate && endDate) {
      filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
      });
    }
    
    return filteredSales.map(sale => ({
      id: sale.id,
      fecha: new Date(sale.date).toLocaleDateString(),
      hora: new Date(sale.date).toLocaleTimeString(),
      orden: sale.orderId,
      cliente: `${sale.customer?.name || ''} ${sale.customer?.lastName || ''}`.trim() || 'Cliente no registrado',
      email: sale.customer?.email || 'No especificado',
      telefono: sale.customer?.phone || 'No especificado',
      direccion: [
        sale.customer?.address,
        sale.customer?.city,
        sale.customer?.region,
        sale.customer?.country
      ].filter(Boolean).join(', ') || 'No especificada',
      productos: sale.items.map(item => 
        `${item.productName} (${item.quantity} x $${item.price.toFixed(2)})`
      ).join('; '),
      subtotal: sale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2),
      envio: (sale.shippingCost || 0).toFixed(2),
      total: sale.total.toFixed(2),
      metodoPago: sale.paymentMethod,
      estado: 'Completada'
    }));
  } catch (error) {
    console.error('Error generating sales report:', error);
    return [];
  }
};

export const getTopSellingProducts = (limit = 5) => {
  try {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    return products
      .filter(p => (p.purchaseCount || 0) > 0)
      .sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0))
      .slice(0, limit)
      .map(p => ({
        ...p,
        totalSales: (p.purchaseCount || 0) * (p.price || 0)
      }));
  } catch (error) {
    console.error('Error getting top selling products:', error);
    return [];
  }
};
