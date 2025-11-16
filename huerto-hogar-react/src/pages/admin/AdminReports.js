import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  Table,
  Alert
} from 'react-bootstrap';
import { FaFilePdf, FaFileExcel, FaFileCsv, FaDownload } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const AdminReports = () => {
  const { currentUser } = useAuth();
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [reportType, setReportType] = useState('sales');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load data for reports
  const loadReportData = () => {
    setLoading(true);
    setError('');
    
    try {
      // Get all orders
      let allOrders = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('orders_')) {
          const userOrders = JSON.parse(localStorage.getItem(key) || '[]');
          allOrders = [...allOrders, ...userOrders];
        }
      }

      // Get all products
      const products = JSON.parse(localStorage.getItem('products') || '[]');

      // Filter by date range if specified
      if (dateRange.start && dateRange.end) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        
        allOrders = allOrders.filter(order => {
          const orderDate = new Date(order.date || order.createdAt);
          return orderDate >= startDate && orderDate <= endDate;
        });
      }

      // Process data based on report type
      let processedData = {};
      
      switch(reportType) {
        case 'sales':
          processedData = processSalesData(allOrders);
          break;
        case 'products':
          processedData = processProductsData(allOrders, products);
          break;
        case 'customers':
          processedData = processCustomersData(allOrders);
          break;
        default:
          processedData = processSalesData(allOrders);
      }

      setReportData(processedData);
      setSuccess('Datos cargados correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error loading report data:', error);
      setError('Error al cargar los datos del reporte');
    } finally {
      setLoading(false);
    }
  };

  // Process sales data for charts
  const processSalesData = (orders) => {
    // Group orders by date
    const salesByDate = orders.reduce((acc, order) => {
      const date = new Date(order.date || order.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + (order.total || 0);
      return acc;
    }, {});

    const dates = Object.keys(salesByDate).sort();
    const amounts = dates.map(date => salesByDate[date]);

    return {
      labels: dates,
      datasets: [{
        label: 'Ventas',
        data: amounts,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };
  };

  // Process products data for charts
  const processProductsData = (orders, products) => {
    // Count product sales
    const productSales = {};
    
    orders.forEach(order => {
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          if (item.productId) {
            productSales[item.productId] = (productSales[item.productId] || 0) + (item.quantity || 0);
          }
        });
      }
    });

    // Get top 10 products
    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([productId, sales]) => {
        const product = products.find(p => p.id === productId) || {};
        return {
          id: productId,
          name: product.name || `Producto ${productId}`,
          sales: sales,
          revenue: sales * (product.price || 0)
        };
      });

    return {
      labels: topProducts.map(p => p.name),
      datasets: [{
        label: 'Unidades vendidas',
        data: topProducts.map(p => p.sales),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }],
      tableData: topProducts
    };
  };

  // Process customers data for charts
  const processCustomersData = (orders) => {
    // Group orders by customer
    const customerOrders = orders.reduce((acc, order) => {
      const customerId = order.userId || 'guest';
      if (!acc[customerId]) {
        acc[customerId] = {
          name: order.shipping?.name || `Cliente ${customerId}`,
          orders: 0,
          totalSpent: 0
        };
      }
      acc[customerId].orders += 1;
      acc[customerId].totalSpent += order.total || 0;
      return acc;
    }, {});

    const customers = Object.values(customerOrders);
    
    return {
      labels: customers.map(c => c.name),
      datasets: [{
        label: 'Total gastado',
        data: customers.map(c => c.totalSpent),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }],
      tableData: customers.sort((a, b) => b.totalSpent - a.totalSpent)
    };
  };

  // Export report data
  const exportReport = (format) => {
    if (!reportData) return;
    
    let content = '';
    let filename = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'csv') {
      // Generate CSV content
      if (reportData.tableData) {
        const headers = Object.keys(reportData.tableData[0] || {}).join(',');
        const rows = reportData.tableData.map(item => 
          Object.values(item).map(v => `"${v}"`).join(',')
        );
        content = [headers, ...rows].join('\n');
      } else {
        content = 'No hay datos para exportar';
      }
      
      // Create and trigger download
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } else if (format === 'pdf') {
      // In a real app, you would use a PDF generation library like jspdf or pdfmake
      alert('Generando reporte PDF...');
      console.log('Report data for PDF:', reportData);
      
    } else if (format === 'excel') {
      // Similar to CSV for now
      exportReport('csv');
    }
    
    setSuccess(`Reporte exportado como ${format.toUpperCase()}`);
    setTimeout(() => setSuccess(''), 3000);
  };

  // Set default date range to last 30 days
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
    
    // Load initial data
    loadReportData();
  }, []);

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
      <h1 className="mb-4">Reportes</h1>
      
      {/* Filters */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5 className="mb-3">Filtros</h5>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha de inicio</Form.Label>
                <Form.Control 
                  type="date" 
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha de fin</Form.Label>
                <Form.Control 
                  type="date" 
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Tipo de reporte</Form.Label>
                <Form.Select 
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="sales">Ventas</option>
                  <option value="products">Productos más vendidos</option>
                  <option value="customers">Clientes</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Button 
            variant="primary" 
            onClick={loadReportData}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Generar Reporte'}
          </Button>
        </Card.Body>
      </Card>

      {/* Messages */}
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      {success && <Alert variant="success" className="mb-4">{success}</Alert>}

      {/* Report Content */}
      {reportData && (
        <>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">
                  {reportType === 'sales' && 'Ventas por Fecha'}
                  {reportType === 'products' && 'Productos más Vendidos'}
                  {reportType === 'customers' && 'Clientes por Gasto'}
                </h5>
                <div>
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    className="me-2"
                    onClick={() => exportReport('pdf')}
                    title="Exportar a PDF"
                  >
                    <FaFilePdf className="me-1" /> PDF
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    className="me-2"
                    onClick={() => exportReport('excel')}
                    title="Exportar a Excel"
                  >
                    <FaFileExcel className="me-1" /> Excel
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => exportReport('csv')}
                    title="Exportar a CSV"
                  >
                    <FaFileCsv className="me-1" /> CSV
                  </Button>
                </div>
              </div>
              
              <div style={{ height: '400px' }} className="mb-4">
                {reportType === 'sales' && reportData.labels.length > 0 && (
                  <Line 
                    data={reportData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) => `$${value.toLocaleString()}`
                          }
                        }
                      }
                    }}
                  />
                )}
                
                {(reportType === 'products' || reportType === 'customers') && reportData.labels.length > 0 && (
                  <Bar 
                    data={reportData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: reportType === 'customers' 
                              ? (value) => `$${value.toLocaleString()}`
                              : undefined
                          }
                        }
                      }
                    }}
                  />
                )}
                
                {reportData.labels.length === 0 && (
                  <div className="text-center text-muted py-5">
                    No hay datos para mostrar en el rango de fechas seleccionado.
                  </div>
                )}
              </div>

              {reportData.tableData && reportData.tableData.length > 0 && (
                <div className="mt-4">
                  <h6 className="mb-3">Detalles</h6>
                  <div className="table-responsive">
                    <Table striped bordered hover size="sm">
                      <thead>
                        <tr>
                          {Object.keys(reportData.tableData[0]).map(key => (
                            <th key={key} style={{ textTransform: 'capitalize' }}>
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.tableData.map((item, index) => (
                          <tr key={index}>
                            {Object.values(item).map((value, i) => (
                              <td key={i}>
                                {typeof value === 'number' && !Number.isInteger(value)
                                  ? `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                                  : value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default AdminReports;
