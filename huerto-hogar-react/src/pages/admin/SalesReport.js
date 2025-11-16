import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Card, 
  Table, 
  Button, 
  Row, 
  Col, 
  Form,
  Badge,
  Alert,
  ListGroup
} from 'react-bootstrap';
import { 
  FaFilePdf, 
  FaFileExcel, 
  FaFileCsv, 
  FaSearch, 
  FaFilter, 
  FaDownload,
  FaChartBar
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { getSalesReport, getTopSellingProducts } from '../../utils/salesUtils';

const SalesReport = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    searchTerm: ''
  });
  const [topProducts, setTopProducts] = useState([]);

  // Load sales data
  useEffect(() => {
    loadSalesData();
    loadTopProducts();
  }, []);

  const loadSalesData = () => {
    try {
      const reportData = getSalesReport(filters.startDate, filters.endDate);
      setSales(reportData);
      setFilteredSales(reportData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading sales data:', error);
      setError('Error al cargar los datos de ventas');
      setLoading(false);
    }
  };

  const loadTopProducts = () => {
    try {
      const products = getTopSellingProducts(5);
      setTopProducts(products);
    } catch (error) {
      console.error('Error loading top products:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = (e) => {
    if (e) e.preventDefault(); // Prevent form submission if called from a form
    
    try {
      let filtered = [...sales];
      
      // Apply search term filter if provided
      if (filters.searchTerm.trim()) {
        const searchLower = filters.searchTerm.toLowerCase().trim();
        filtered = filtered.filter(sale => 
          (sale.orden && sale.orden.toString().toLowerCase().includes(searchLower)) ||
          (sale.cliente && sale.cliente.toLowerCase().includes(searchLower)) ||
          (sale.email && sale.email.toLowerCase().includes(searchLower))
        );
      }
      
      // Apply date range filter if both dates are provided
      if (filters.startDate && filters.endDate) {
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // Include the entire end date
        
        filtered = filtered.filter(sale => {
          try {
            const saleDate = sale.date 
              ? new Date(sale.date) 
              : new Date(sale.fecha.split('/').reverse().join('-'));
            
            if (isNaN(saleDate.getTime())) return false; // Skip invalid dates
            
            return saleDate >= startDate && saleDate <= endDate;
          } catch (error) {
            console.error('Error processing sale date:', sale, error);
            return false;
          }
        });
      }
      
      setFilteredSales(filtered);
      setError('');
    } catch (error) {
      console.error('Error applying filters:', error);
      setError('Error al aplicar los filtros. Por favor, intente nuevamente.');
    }
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      searchTerm: ''
    });
    loadSalesData();
  };

  // Export functions
  const exportToCSV = () => {
    const csvData = filteredSales.map(sale => ({
      'Fecha': sale.fecha,
      'Hora': sale.hora,
      'Orden': sale.orden,
      'Cliente': sale.cliente,
      'Email': sale.email,
      'Teléfono': sale.telefono,
      'Dirección': sale.direccion,
      'Productos': sale.productos,
      'Subtotal': sale.subtotal,
      'Envío': sale.envio,
      'Total': sale.total,
      'Método de Pago': sale.metodoPago,
      'Estado': sale.estado
    }));

    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
    XLSX.writeFile(wb, `reporte_ventas_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const exportToPDF = () => {
    try {
      // Initialize jsPDF
      const doc = new jsPDF();
      const title = 'Reporte de Ventas';
      
      // Add title and date
      doc.setFontSize(18);
      doc.text(title, 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generado el: ${format(new Date(), "PPPP", { locale: es })}`, 14, 30);
      
      // Prepare table data
      const headers = [
        'Fecha',
        'Orden',
        'Cliente',
        'Total',
        'Estado'
      ];

      const data = filteredSales.map(sale => ({
        fecha: sale.fecha,
        orden: sale.orden,
        cliente: sale.cliente,
        total: `$${sale.total}`,
        estado: sale.estado
      }));

      // Add the table
      doc.autoTable({
        head: [headers],
        body: data.map(item => Object.values(item)),
        startY: 40,
        styles: { 
          fontSize: 8,
          cellPadding: 2,
          valign: 'middle',
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          lineWidth: 0.1
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { top: 10 }
      });

      // Save the PDF
      doc.save(`reporte_ventas_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Error al generar el archivo PDF. Por favor, intente nuevamente.');
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredSales);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
    XLSX.writeFile(wb, `reporte_ventas_detallado_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando reporte de ventas...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Reporte de Ventas</h2>
        <div>
          <Button variant="outline-secondary" className="me-2" onClick={exportToPDF}>
            <FaFilePdf className="me-2" /> PDF
          </Button>
          <Button variant="outline-success" className="me-2" onClick={exportToExcel}>
            <FaFileExcel className="me-2" /> Excel
          </Button>
          <Button variant="outline-primary" onClick={exportToCSV}>
            <FaFileCsv className="me-2" /> CSV
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-light">
          <h5 className="mb-0"><FaFilter className="me-2" />Filtros</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha de inicio</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha de fin</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Buscar (cliente, orden, producto)</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FaSearch />
                  </span>
                  <Form.Control
                    type="text"
                    name="searchTerm"
                    placeholder="Buscar..."
                    value={filters.searchTerm}
                    onChange={handleFilterChange}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button variant="primary" className="me-2" onClick={applyFilters}>
                Aplicar
              </Button>
              <Button variant="outline-secondary" onClick={resetFilters}>
                Limpiar
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col lg={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Historial de Ventas</h5>
              <small className="text-muted">{filteredSales.length} ventas encontradas</small>
            </Card.Header>
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Fecha</th>
                    <th>Orden</th>
                    <th>Cliente</th>
                    <th className="text-end">Total</th>
                    <th>Estado</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.length > 0 ? (
                    filteredSales.map((sale) => (
                      <tr key={sale.id}>
                        <td>
                          <div className="fw-bold">{sale.fecha}</div>
                          <small className="text-muted">{sale.hora}</small>
                        </td>
                        <td>{sale.orden}</td>
                        <td>
                          <div className="fw-bold">{sale.cliente}</div>
                          <small className="text-muted">{sale.email}</small>
                        </td>
                        <td className="text-end fw-bold">${sale.total}</td>
                        <td>
                          <Badge bg={sale.estado === 'Completada' ? 'success' : 'warning'}>
                            {sale.estado}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/admin/ordenes/${sale.orden}`)}
                          >
                            Ver
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        No se encontraron ventas que coincidan con los filtros
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0"><FaChartBar className="me-2" />Productos más vendidos</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <ListGroup.Item key={product.id} className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="me-3 text-primary fw-bold">{index + 1}.</div>
                      <div>
                        <div className="fw-bold">{product.name}</div>
                        <small className="text-muted">${product.price?.toFixed(2)} c/u</small>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold">{product.purchaseCount} vendidos</div>
                      <small className="text-success fw-bold">
                        ${product.totalSales?.toFixed(2)}
                      </small>
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item className="text-center py-4">
                  No hay datos de productos vendidos
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>

          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Resumen de Ventas</h5>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Ventas totales:</span>
                <span className="fw-bold">{filteredSales.length}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Ingresos totales:</span>
                <span className="fw-bold">
                  ${filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0).toFixed(2)}
                </span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Productos únicos vendidos:</span>
                <span className="fw-bold">
                  {[...new Set(filteredSales.flatMap(sale => sale.productos.split(';').map(p => p.trim())))].length}
                </span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Promedio por venta:</span>
                <span className="fw-bold">
                  ${filteredSales.length > 0 
                    ? (filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0) / filteredSales.length).toFixed(2)
                    : '0.00'}
                </span>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SalesReport;
