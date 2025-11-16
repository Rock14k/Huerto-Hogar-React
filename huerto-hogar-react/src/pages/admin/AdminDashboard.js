import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Badge, 
  ProgressBar,
  Tab,
  Tabs,
  Button,
  Table
} from 'react-bootstrap';
import { 
  FaBox, 
  FaUsers, 
  FaShoppingCart, 
  FaChartLine, 
  FaDownload,
  FaFilter,
  FaSearch
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { products } from '../../data/products';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('resumen');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: [], 
    salesData: {
      labels: [],
      datasets: []
    },
    userGrowth: {
      labels: [],
      datasets: []
    }
  });

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [startDate, endDate]);

  const loadDashboardData = () => {
    // Get real products data
    const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    const totalProducts = storedProducts.length;
    const totalStock = storedProducts.reduce((sum, product) => sum + (product.stock || 0), 0);
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const totalUsers = users.length;
    
    // Get real orders from localStorage
    let allOrders = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('orders_')) {
        const userOrders = JSON.parse(localStorage.getItem(key) || '[]');
        allOrders = [...allOrders, ...userOrders];
      }
    }
    
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Preparar datos para los gráficos
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    // Datos de ventas mensuales
    const salesByMonth = Array(12).fill(0);
    allOrders.forEach(order => {
      if (order.date) {
        const month = new Date(order.date).getMonth();
        salesByMonth[month] += order.total || 0;
      }
    });
    
    const salesData = {
      labels: months,
      datasets: [
        {
          label: 'Ventas 2023',
          data: salesByMonth,
          fill: false,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.4
        }
      ]
    };

    // Datos de crecimiento de usuarios
    const usersByMonth = Array(12).fill(0);
    users.forEach(user => {
      if (user.createdAt) {
        const month = new Date(user.createdAt).getMonth();
        usersByMonth[month]++;
      }
    });
    
    const userGrowth = {
      labels: months,
      datasets: [
        {
          label: 'Nuevos Usuarios',
          data: usersByMonth,
          fill: true,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          tension: 0.4
        }
      ]
    };
    
    // Simular carga de datos
    const mockStats = {
      totalProducts: totalProducts,
      totalUsers: totalUsers,
      totalOrders: totalOrders,
      totalRevenue: totalRevenue,
      recentOrders: [
        { id: 'ORD-12345', customer: 'Juan Pérez', total: 45.99, status: 'completado' },
        { id: 'ORD-12344', customer: 'María González', total: 89.50, status: 'enviado' },
        { id: 'ORD-12343', customer: 'Carlos López', total: 120.00, status: 'procesando' },
        { id: 'ORD-12342', customer: 'Ana Martínez', total: 67.30, status: 'completado' },
        { id: 'ORD-12341', customer: 'Pedro Sánchez', total: 34.99, status: 'cancelado' },
      ],
      topProducts: [
        { name: 'Kit de Herramientas', sales: 45 },
        { name: 'Semillas Orgánicas', sales: 38 },
        { name: 'Macetero de Madera', sales: 32 },
        { name: 'Tijeras de Podar', sales: 28 },
        { name: 'Fertilizante Natural', sales: 25 },
      ],
      salesData: salesData,
      userGrowth: userGrowth
    };
    
    setStats({
      totalProducts: totalProducts,
      totalUsers: totalUsers,
      totalOrders: allOrders.length,
      totalRevenue: allOrders.reduce((sum, order) => sum + (order.total || 0), 0),
      recentOrders: allOrders
        .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
        .slice(0, 5)
        .map(order => ({
          id: order.id || 'N/A',
          customer: order.shipping?.name || order.email || 'Cliente no especificado',
          total: order.total || 0,
          status: order.status || 'pendiente',
          date: order.date || new Date().toISOString()
        })),
      topProducts: storedProducts
        .sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0))
        .slice(0, 5)
        .map(product => ({
          id: product.id,
          name: product.name,
          sales: product.purchaseCount || 0,
          stock: product.stock || 0
        })),
      salesData: salesData,
      userGrowth: userGrowth
    });
  };

  // Generate PDF Report
  const generatePDFReport = () => {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    // Create PDF content
    const content = {
      pageSize: 'A4',
      content: [
        { text: 'Reporte de Productos - Huerto Hogar', style: 'header' },
        { text: `Generado el: ${new Date().toLocaleDateString()}`, style: 'subheader' },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto', 'auto'],
            body: [
              ['ID', 'Producto', 'Precio', 'Stock', 'Ventas'],
              ...products.map(p => [
                p.id.substring(0, 8) + '...',
                p.name,
                `$${p.price?.toLocaleString() || '0'}`,
                p.stock || 0,
                p.purchaseCount || 0
              ])
            ]
          }
        }
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 12, margin: [0, 0, 10, 5] },
        tableExample: { margin: [0, 5, 0, 15] }
      }
    };

    // In a real app, you would use a PDF generation library like jspdf or pdfmake
    // For now, we'll show an alert with the content
    alert('Generando reporte PDF con ' + products.length + ' productos...');
    console.log('PDF Content:', content);
  };

  // Generate Excel/CSV Report
  const generateExcelReport = () => {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const orders = [];
    
    // Get all orders
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('orders_')) {
        const userOrders = JSON.parse(localStorage.getItem(key) || '[]');
        orders.push(...userOrders);
      }
    }
    
    // Create CSV content
    const productData = [
      ['ID', 'Producto', 'Precio', 'Stock', 'Ventas', 'Estado'],
      ...products.map(p => [
        p.id,
        p.name,
        `$${p.price?.toLocaleString() || '0'}`,
        p.stock || 0,
        p.purchaseCount || 0,
        p.status || 'active'
      ])
    ];
    
    const orderData = [
      ['ID Pedido', 'Cliente', 'Fecha', 'Total', 'Estado'],
      ...orders.map(o => [
        o.id || 'N/A',
        o.shipping?.name || o.email || 'Cliente no especificado',
        new Date(o.date || new Date()).toLocaleDateString(),
        `$${o.total?.toLocaleString() || '0'}`,
        o.status || 'pendiente'
      ])
    ];
    
    // Function to download CSV
    const downloadCSV = (data, filename) => {
      const csvContent = data.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    // Download both reports
    downloadCSV(productData, `reporte_productos_${new Date().toISOString().split('T')[0]}.csv`);
    downloadCSV(orderData, `reporte_pedidos_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Generate CSV Report (alias for Excel report)
  const generateCSVReport = () => {
    generateExcelReport();
  };

  // Verify if user is admin
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <Container className="mt-5">
        <div className="alert alert-danger">Acceso denegado. No tienes permisos de administrador.</div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Panel de Administración</h1>
        <div>
          <Button variant="outline-secondary" className="me-2" onClick={generatePDFReport}>
            <FaDownload className="me-2" /> Exportar Reporte
          </Button>
          <Link to="/admin/ajustes" className="btn btn-outline-primary">
            Configuración
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5 className="mb-3"><FaFilter className="me-2" />Filtros Avanzados</h5>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha de Inicio</Form.Label>
                <DatePicker
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="form-control"
                  dateFormat="dd/MM/yyyy"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha de Término</Form.Label>
                <DatePicker
                  selected={endDate}
                  onChange={date => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="form-control"
                  dateFormat="dd/MM/yyyy"
                />
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button variant="primary" className="w-100">
                <FaSearch className="me-2" /> Aplicar Filtros
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Resumen General */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="resumen" title="Resumen">
          <Row className="g-4 mb-4">
            <Col md={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Productos</h6>
                      <h3 className="mb-0">{stats.totalProducts}</h3>
                      <small className="text-success">+12% este mes</small>
                    </div>
                    <div className="bg-primary bg-opacity-10 p-3 rounded">
                      <FaBox className="text-primary" size={24} />
                    </div>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-transparent border-top-0">
                  <Link to="/admin/productos" className="text-decoration-none">
                    Ver todos los productos <i className="bi bi-arrow-right"></i>
                  </Link>
                </Card.Footer>
              </Card>
            </Col>

            <Col md={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Usuarios</h6>
                      <h3 className="mb-0">{stats.totalUsers}</h3>
                      <small className="text-success">+8% este mes</small>
                    </div>
                    <div className="bg-success bg-opacity-10 p-3 rounded">
                      <FaUsers className="text-success" size={24} />
                    </div>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-transparent border-top-0">
                  <Link to="/admin/usuarios" className="text-decoration-none">
                    Ver todos los usuarios <i className="bi bi-arrow-right"></i>
                  </Link>
                </Card.Footer>
              </Card>
            </Col>

            <Col md={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Órdenes</h6>
                      <h3 className="mb-0">{stats.totalOrders}</h3>
                      <small className="text-success">+15% este mes</small>
                    </div>
                    <div className="bg-warning bg-opacity-10 p-3 rounded">
                      <FaShoppingCart className="text-warning" size={24} />
                    </div>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-transparent border-top-0">
                  <Link to="/admin/ordenes" className="text-decoration-none">
                    Ver todas las órdenes <i className="bi bi-arrow-right"></i>
                  </Link>
                </Card.Footer>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Ventas</h6>
                    <h3 className="mb-0">{
                      JSON.parse(localStorage.getItem('sales') || '[]').length
                    }</h3>
                    <small className="text-success">Gestión de ventas</small>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <FaShoppingCart className="text-primary" size={24} />
                  </div>
                </div>
              </Card.Body>
              <Card.Footer className="bg-transparent border-top-0">
                <Link to="/admin/ventas" className="text-decoration-none">
                  Ver gestión de ventas <i className="bi bi-arrow-right"></i>
                </Link>
              </Card.Footer>
            </Card>
          </Col>

          </Row>

          <Row className="mt-4">
            <Col lg={8}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Ventas Mensuales</h5>
                    <div>
                      <Button variant="outline-secondary" size="sm" className="me-2">
                        Mensual
                      </Button>
                      <Button variant="outline-secondary" size="sm">
                        Anual
                      </Button>
                    </div>
                  </div>
                  <div style={{ height: '300px' }}>
                    <Line 
                      data={{
                        labels: stats.salesData?.labels || [],
                        datasets: [
                          {
                            label: 'Ventas',
                            data: stats.salesData?.data || [],
                            borderColor: 'rgba(75, 192, 192, 1)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            tension: 0.4,
                            fill: true
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: {
                              display: true,
                              drawBorder: false
                            },
                            ticks: {
                              callback: (value) => `$${value.toLocaleString()}`
                            }
                          },
                          x: {
                            grid: {
                              display: false
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">Productos más vendidos</h5>
                  <div className="mb-4">
                    {stats.topProducts.map((product, index) => (
                      <div key={index} className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>{product.name}</span>
                          <span className="text-muted">{product.sales} ventas</span>
                        </div>
                        <ProgressBar 
                          now={(product.sales / stats.topProducts[0].sales) * 100} 
                          variant={index % 2 === 0 ? 'primary' : 'success'}
                          style={{ height: '8px' }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <Link to="/admin/productos?sort=sales_desc" className="btn btn-outline-primary btn-sm">
                      Ver todos los productos
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">Crecimiento de Usuarios</h5>
                  <div style={{ height: '250px' }}>
                    <Bar 
                      data={stats.userGrowth}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 20
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Órdenes Recientes</h5>
                    <Link to="/admin/ordenes" className="btn btn-sm btn-outline-primary">
                      Ver todas
                    </Link>
                  </div>
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead>
                        <tr>
                          <th># Orden</th>
                          <th>Cliente</th>
                          <th>Total</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentOrders.map((order, index) => (
                          <tr key={index}>
                            <td>
                              <Link to={`/admin/ordenes/${order.id}`} className="text-decoration-none">
                                {order.id}
                              </Link>
                            </td>
                            <td>{order.customer}</td>
                            <td>${order.total.toFixed(2)}</td>
                            <td>
                              <Badge 
                                bg={
                                  order.status === 'completado' ? 'success' :
                                  order.status === 'enviado' ? 'info' :
                                  order.status === 'procesando' ? 'warning' : 'secondary'
                                }
                              >
                                {order.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="reportes" title="Reportes">
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h5 className="mb-4">Generar Reporte Personalizado</h5>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tipo de Reporte</Form.Label>
                    <Form.Select>
                      <option>Ventas</option>
                      <option>Usuarios</option>
                      <option>Inventario</option>
                      <option>Personalizado</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Formato</Form.Label>
                    <Form.Select>
                      <option>PDF</option>
                      <option>Excel</option>
                      <option>CSV</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  <Button variant="primary" className="w-100">
                    <FaDownload className="me-2" /> Generar Reporte
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Row>
            <Col md={6}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">Distribución de Ventas por Categoría</h5>
                  <div style={{ height: '300px' }}>
                    <Pie 
                      data={{
                        labels: ['Herramientas', 'Semillas', 'Maceteros', 'Fertilizantes', 'Otros'],
                        datasets: [{
                          data: [35, 25, 20, 15, 5],
                          backgroundColor: [
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(153, 102, 255, 0.7)',
                            'rgba(255, 159, 64, 0.7)'
                          ],
                          borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                          ],
                          borderWidth: 1
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right'
                          }
                        }
                      }}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">Rendimiento de Ventas</h5>
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Meta Mensual</span>
                      <span>75% Completado</span>
                    </div>
                    <ProgressBar now={75} variant="success" style={{ height: '10px' }} />
                  </div>
                  
                  <div className="mb-4">
                    <h6 className="mb-3">Comparación con el Mes Anterior</h6>
                    <Row>
                      <Col xs={6}>
                        <div className="text-center p-3 border rounded">
                          <div className="text-muted small">Mes Actual</div>
                          <h4 className="text-success mb-0">$12,450</h4>
                          <small className="text-success">+15%</small>
                        </div>
                      </Col>
                      <Col xs={6}>
                        <div className="text-center p-3 border rounded">
                          <div className="text-muted small">Mes Anterior</div>
                          <h4 className="text-muted mb-0">$10,820</h4>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  <div>
                    <h6 className="mb-3">Métricas Clave</h6>
                    <Table borderless size="sm" className="mb-0">
                      <tbody>
                        <tr>
                          <td>Tasa de Conversión</td>
                          <td className="text-end">3.2%</td>
                        </tr>
                        <tr>
                          <td>Ticket Promedio</td>
                          <td className="text-end">$45.67</td>
                        </tr>
                        <tr>
                          <td>Clientes Recurrentes</td>
                          <td className="text-end">42%</td>
                        </tr>
                        <tr>
                          <td>Productos por Orden</td>
                          <td className="text-end">2.8</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AdminDashboard;
