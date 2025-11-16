import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Table, 
  Button, 
  Modal, 
  Form,
  Alert,
  Row,
  Col,
  Card,
  Badge,
  InputGroup
} from 'react-bootstrap';
import { 
  FaSearch, 
  FaFilter, 
  FaFilePdf, 
  FaFileExcel, 
  FaFileCsv,
  FaEye,
  FaPrint,
  FaTimes
} from 'react-icons/fa';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { getAllSales, getFilteredSales } from '../../utils/salesUtils';

const SalesManagement = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    searchTerm: ''
  });

  // Cargar ventas al montar el componente
  useEffect(() => {
    loadSales();
  }, [filters]);

  const loadSales = () => {
    try {
      const salesData = getFilteredSales(filters);
      setSales(salesData);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      setError('Error al cargar las ventas');
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      searchTerm: ''
    });
  };

  const viewSaleDetails = (sale) => {
    setSelectedSale(sale);
    setShowDetails(true);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(sales);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
    XLSX.writeFile(wb, 'ventas.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Reporte de Ventas', 14, 15);
    doc.autoTable({
      head: [['ID', 'Fecha', 'Cliente', 'Total', 'Estado']],
      body: sales.map(sale => [
        sale.id,
        format(new Date(sale.date), 'dd/MM/yyyy'),
        `${sale.customer?.name || ''} ${sale.customer?.lastName || ''}`.trim(),
        `$${sale.total?.toLocaleString() || '0'}`,
        sale.status || 'Completada'
      ])
    });
    doc.save('reporte-ventas.pdf');
  };

  if (loading) {
    return (
      <Container className="py-4">
        <Card>
          <Card.Body className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2 mb-0">Cargando ventas...</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Gestión de Ventas</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Filtros de Búsqueda</h5>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={resetFilters}
            >
              Limpiar Filtros
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha Inicio</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha Fin</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  min={filters.startDate}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Buscar</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="ID de orden o cliente..."
                    name="searchTerm"
                    value={filters.searchTerm}
                    onChange={handleFilterChange}
                  />
                  <Button variant="outline-secondary">
                    <FaSearch />
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Listado de Ventas</h5>
          <div>
            <Button variant="outline-primary" size="sm" className="me-2" onClick={exportToExcel}>
              <FaFileExcel className="me-1" /> Excel
            </Button>
            <Button variant="outline-danger" size="sm" onClick={exportToPDF}>
              <FaFilePdf className="me-1" /> PDF
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th># Orden</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th className="text-end">Total</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sales.length > 0 ? (
                  sales.map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.orderId || 'N/A'}</td>
                      <td>{format(new Date(sale.date), 'dd/MM/yyyy')}</td>
                      <td>
                        {sale.customer 
                          ? `${sale.customer.name || ''} ${sale.customer.lastName || ''}`.trim() 
                          : 'Cliente no disponible'}
                      </td>
                      <td className="text-end">${sale.total?.toLocaleString() || '0'}</td>
                      <td>
                        <Badge bg={sale.status === 'completed' ? 'success' : 'secondary'}>
                          {sale.status === 'completed' ? 'Completada' : 'Pendiente'}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => viewSaleDetails(sale)}
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => window.print()}
                        >
                          <FaPrint />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No se encontraron ventas con los filtros actuales
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Modal de Detalles de Venta */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalles de la Venta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSale && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <h6>Información de la Orden</h6>
                  <p className="mb-1"><strong>N° Orden:</strong> {selectedSale.orderId || 'N/A'}</p>
                  <p className="mb-1"><strong>Fecha:</strong> {format(new Date(selectedSale.date), 'dd/MM/yyyy HH:mm')}</p>
                  <p className="mb-1"><strong>Estado:</strong> 
                    <Badge bg={selectedSale.status === 'completed' ? 'success' : 'secondary'}>
                      {selectedSale.status === 'completed' ? 'Completada' : 'Pendiente'}
                    </Badge>
                  </p>
                </Col>
                <Col md={6}>
                  <h6>Información del Cliente</h6>
                  <p className="mb-1"><strong>Nombre:</strong> {
                    selectedSale.customer 
                      ? `${selectedSale.customer.name || ''} ${selectedSale.customer.lastName || ''}`.trim()
                      : 'No disponible'
                  }</p>
                  <p className="mb-1"><strong>Email:</strong> {selectedSale.customer?.email || 'No disponible'}</p>
                  <p className="mb-1"><strong>Teléfono:</strong> {selectedSale.customer?.phone || 'No disponible'}</p>
                </Col>
              </Row>

              <h6>Productos</h6>
              <Table bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th className="text-center">Cantidad</th>
                    <th className="text-end">Precio Unitario</th>
                    <th className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSale.items?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.productName || 'Producto sin nombre'}</td>
                      <td className="text-center">{item.quantity || 0}</td>
                      <td className="text-end">${(item.price || 0).toLocaleString()}</td>
                      <td className="text-end">${((item.price || 0) * (item.quantity || 0)).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-end"><strong>Subtotal:</strong></td>
                    <td className="text-end">${(selectedSale.subtotal || 0).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-end"><strong>Envío:</strong></td>
                    <td className="text-end">${(selectedSale.shippingCost || 0).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                    <td className="text-end">
                      <strong>${(selectedSale.total || 0).toLocaleString()}</strong>
                    </td>
                  </tr>
                </tfoot>
              </Table>

              {selectedSale.paymentMethod && (
                <div className="mt-3">
                  <h6>Información de Pago</h6>
                  <p className="mb-1"><strong>Método de pago:</strong> {
                    selectedSale.paymentMethod === 'webpay' ? 'WebPay' :
                    selectedSale.paymentMethod === 'transfer' ? 'Transferencia Bancaria' :
                    'Desconocido'
                  }</p>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={() => window.print()}>
            <FaPrint className="me-1" /> Imprimir
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SalesManagement;
