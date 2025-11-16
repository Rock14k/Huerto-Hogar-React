const testSales = [
  {
    id: 'SALE-001',
    orderId: 'ORD-001',
    date: new Date().toISOString(),
    customer: {
      name: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      phone: '+56912345678',
      address: 'Av. Principal 123',
      city: 'Santiago',
      region: 'RM',
      country: 'Chile'
    },
    items: [
      {
        productId: 'P001',
        productName: 'Lechuga Hidropónica',
        quantity: 2,
        price: 2990
      },
      {
        productId: 'P002',
        productName: 'Tomate Cherry',
        quantity: 1,
        price: 3990
      }
    ],
    subtotal: 9970,
    shippingCost: 2990,
    total: 12960,
    paymentMethod: 'WebPay',
    status: 'completed'
  }
];

localStorage.setItem('sales', JSON.stringify(testSales));
console.log('Datos de prueba de ventas agregados correctamente');
