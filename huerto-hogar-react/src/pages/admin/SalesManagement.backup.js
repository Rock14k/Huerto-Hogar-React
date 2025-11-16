import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Table, 
  Button, 
  Row, 
  Col, 
  Form,
  Card,
  Badge,
  Alert,
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
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    searchTerm: ''
  });
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Load sales data
  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = () => {
    try {
      const salesData = getFilteredSales(filters);
      setSales(salesData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading sales:', error);
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

  const applyFilters = (e) => {
    e?.preventDefault();
    setLoading(true);
    loadSales();
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      searchTerm: ''
    });
    loadSales();
  };

  const viewSaleDetails = (sale) => {
    setSelectedSale(sale);
    setShowDetails(true);
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Asegurarse de que solo se genere una página
      if (doc.internal.getNumberOfPages() > 1) {
        doc.deletePage(2);
      }
      
      // Título y fecha
      doc.setFontSize(18);
      doc.text('Reporte de Ventas', 14, 20);
      doc.setFontSize(10);
      doc.text(`Generado el: ${format(new Date(), "PPPP", { locale: es })}`, 14, 30);
      
      // Preparar datos de la tabla
      const headers = [
        'Fecha',
        'Orden',
        'Cliente',
        'Producto',
        'Cant',
        'Precio',
        'Total'
      ];

      // Agrupar ventas por orden para evitar duplicados
      const ventasAgrupadas = [];
      sales.forEach(sale => {
        const customerName = `${sale.customer?.name || ''} ${sale.customer?.lastName || ''}`.trim() || 'Cliente no registrado';
        const date = format(new Date(sale.date), 'dd/MM/yyyy HH:mm');
        
        // Si la orden ya existe, solo agregar los items
        const ordenExistente = ventasAgrupadas.find(v => v.orden === sale.orderId);
        
        if (ordenExistente) {
          sale.items?.forEach(item => {
            ordenExistente.items.push({
              producto: item.productName || 'Producto no especificado',
              cantidad: item.quantity || 1,
              precio: item.price || 0,
              total: (item.price || 0) * (item.quantity || 1)
            });
          });
        } else {
          ventasAgrupadas.push({
            fecha: date,
            orden: sale.orderId,
            cliente: customerName,
            items: sale.items?.map(item => ({
              producto: item.productName || 'Producto no especificado',
              cantidad: item.quantity || 1,
              precio: item.price || 0,
              total: (item.price || 0) * (item.quantity || 1)
            })) || []
          });
        }
      });

      // Preparar datos para la tabla
      const tableData = [];
      let yPos = 40;
      
      ventasAgrupadas.forEach((venta, index) => {
        // Agregar encabezado de la orden
        if (index > 0) {
          yPos += 10; // Espacio entre órdenes
          if (yPos > 250) { // Si se está quedando sin espacio, nueva página
            doc.addPage();
            yPos = 20;
          }
        }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Orden #${venta.orden} - ${venta.cliente}`, 14, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(`Fecha: ${venta.fecha}`, 14, yPos + 5);
        
        // Tabla de productos
        const productos = venta.items.map(item => [
          item.producto,
          item.cantidad,
          `$${item.precio.toFixed(2)}`,
          `$${item.total.toFixed(2)}`
        ]);
        
        doc.autoTable({
          startY: yPos + 10,
          head: [['Producto', 'Cant', 'Precio', 'Total']],
          body: productos,
          margin: { top: 10 },
          styles: { 
            fontSize: 8,
            cellPadding: 2,
            valign: 'middle',
            textColor: [0, 0, 0],
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
          },
          headStyles: { 
            fillColor: [41, 128, 185],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            lineWidth: 0.1
          },
          columnStyles: {
            0: { cellWidth: 90 }, // Producto
            1: { cellWidth: 20 }, // Cantidad
            2: { cellWidth: 30 }, // Precio
            3: { cellWidth: 30 }  // Total
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          didDrawPage: function(data) {
            // Actualizar la posición Y para la siguiente orden
            yPos = data.cursor.y + 10;
          }
        });
        
        // Total de la orden
        const totalOrden = venta.items.reduce((sum, item) => sum + item.total, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Orden: $${totalOrden.toFixed(2)}`, 140, yPos + 5, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        
        yPos += 15; // Espacio después del total
      });
      
      // Totales generales
      const totalVentas = ventasAgrupadas.reduce((sum, venta) => {
        return sum + venta.items.reduce((sumItems, item) => sumItems + item.total, 0);
      }, 0);
      
      const totalArticulos = ventasAgrupadas.reduce((sum, venta) => {
        return sum + venta.items.reduce((sumItems, item) => sumItems + item.cantidad, 0);
      }, 0);
      
      // Si hay espacio, agregar en la última página, si no, nueva página
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Total General de Ventas: $${totalVentas.toFixed(2)}`, 14, yPos + 10);
      doc.text(`Total de Artículos Vendidos: ${totalArticulos}`, 14, yPos + 20);
      
      // Eliminar páginas adicionales si las hay
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = pageCount; i > 1; i--) {
        doc.deletePage(i);
      }
      
      // Guardar el PDF
      doc.save(`ventas_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.pdf`);
      
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      setError('Error al generar el PDF');
    }
  };

  const exportToExcel = () => {
    try {
      const data = sales.map(sale => ({
        'Fecha': format(new Date(sale.date), 'dd/MM/yyyy HH:mm'),
        'N° Orden': sale.orderId,
        'Cliente': `${sale.customer?.name || ''} ${sale.customer?.lastName || ''}`.trim() || 'Cliente no registrado',
        'Email': sale.customer?.email || 'No especificado',
        'Teléfono': sale.customer?.phone || 'No especificado',
        'Productos': sale.items?.map(item => `${item.quantity}x ${item.productName}`).join('; ') || '',
        'Subtotal': `$${sale.subtotal?.toFixed(2) || '0.00'}`,
        'Envío': `$${sale.shippingCost?.toFixed(2) || '0.00'}`,
        'Total': `$${sale.total?.toFixed(2) || '0.00'}`,
        'Método de Pago': sale.paymentMethod || 'No especificado',
        'Estado': 'Completada'
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
      XLSX.writeFile(wb, `ventas_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setError('Error al exportar a Excel');
    }
  };

  const exportToCSV = () => {
    try {
      const data = sales.map(sale => ({
        'Fecha': format(new Date(sale.date), 'dd/MM/yyyy HH:mm'),
        'N° Orden': sale.orderId,
        'Cliente': `${sale.customer?.name || ''} ${sale.customer?.lastName || ''}`.trim() || 'Cliente no registrado',
        'Email': sale.customer?.email || 'No especificado',
        'Productos': sale.items?.map(item => `${item.quantity}x ${item.productName}`).join('; ') || '',
        'Total': `$${sale.total?.toFixed(2) || '0.00'}`,
        'Método de Pago': sale.paymentMethod || 'No especificado'
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ventas_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      setError('Error al exportar a CSV');
    }
  };

  if (loading) {
      return (
          <Container className="py-4">
              <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-2">Cargando ventas...</p>
              </div>
          </Container>
      );

      const handlePrint = () => {
          const printWindow = window.open('', '_blank');
          if (printWindow) {
              const content = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Detalles de Venta</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
              .table th, .table td { border: 1px solid #dee2e6; padding: 0.5rem; }
              .table thead th { background-color: #f8f9fa; }
              .text-end { text-align: right; }
              .fw-bold { font-weight: bold; }
              .border-top { border-top: 1px solid #dee2e6; padding-top: 1rem; }
            </style>
          </head>
          <body>
            ${document.getElementById('sale-details')?.outerHTML || 'No se pudo cargar el contenido'}
            <script>
              window.onload = function() {
                // Remove all buttons and non-essential elements
                const elementsToRemove = document.querySelectorAll('.no-print, button, .btn, .modal-footer, .modal-header .btn-close');
                elementsToRemove.forEach(el => el.remove());
                
                // Adjust styles for printing
                document.body.style.padding = '20px';
                
                // Trigger print
                setTimeout(() => {
                  window.print();
                  window.onafterprint = function() {
                    window.close();
                  };
                }, 500);
              };
            </script>
          </body>
        </html>
      `;
              printWindow.document.write(content);
              printWindow.document.close();
          } else {
              window.print();
          }
      };

      return (
          <Container className="py-4">
              <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          
          .modal.show {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 20px;
            width: 100%;
            height: auto;
            z-index: 9999;
            opacity: 1;
            display: block !important;
            visibility: visible;
            background: white;
          }
          
          .modal-dialog {
            max-width: 100%;
            margin: 0;
          }
          
          .modal-content {
            border: none;
            box-shadow: none;
          }
          
          .no-print,
          .no-print *,
          button,
          .btn,
          .modal-footer,
          .btn-close {
            display: none !important;
          }
          
          .table {
            width: 100%;
            margin-bottom: 1rem;
            color: #212529;
            border-collapse: collapse;
          }
          
          .table th,
          .table td {
            padding: 8px;
            border: 1px solid #dee2e6;
            vertical-align: top;
            font-size: 12px;
          }
          
          .table thead th {
            background-color: #f8f9fa !important;
            color: #000 !important;
            border-bottom: 2px solid #dee2e6;
          }
          
          @page {
            size: A4;
            margin: 1cm;
          }
          
          tr {
            page-break-inside: avoid;
          }
        }
      `}</style>
              {/* Filtros */}
              <Card className="mb-4 shadow-sm">
                  <Card.Header className="bg-light">
                      <h5 className="mb-0"><FaFilter className="me-2"/>Filtros</h5>
                  </Card.Header>
                  <Card.Body>
                      <Form onSubmit={applyFilters}>
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
                                      <Form.Label>Buscar (orden, cliente, email)</Form.Label>
                                      <InputGroup>
                                          <InputGroup.Text>
                                              <FaSearch/>
                                          </InputGroup.Text>
                                          <Form.Control
                                              type="text"
                                              name="searchTerm"
                                              placeholder="Buscar..."
                                              value={filters.searchTerm}
                                              onChange={handleFilterChange}
                                          />
                                      </InputGroup>
                                  </Form.Group>
                              </Col>
                              <Col md={2} className="d-flex align-items-end">
                                  <Button type="submit" variant="primary" className="me-2">
                                      Aplicar
                                  </Button>
                                  <Button variant="outline-secondary" onClick={resetFilters}>
                                      Limpiar
                                  </Button>
                              </Col>
                          </Row>
                      </Form>
                  </Card.Body>
              </Card>

              {error && <Alert variant="danger">{error}</Alert>}

              <Card className="shadow-sm">
                  <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Registro de Ventas</h5>
                      <span className="text-muted">{sales.length} ventas encontradas</span>
                  </Card.Header>
                  <div className="table-responsive">
                      <Table hover className="mb-0">
                          <thead className="table-light">
                          <tr>
                              <th>Fecha</th>
                              <th>N° Orden</th>
                              <th>Cliente</th>
                              <th>Productos</th>
                              <th>Total</th>
                              <th>Acciones</th>
                          </tr>
                          </thead>
                          <tbody>
                          {sales.length > 0 ? (
                              sales.map((sale) => (
                                  <tr key={sale.id}>
                                      <td>{format(new Date(sale.date), 'dd/MM/yyyy HH:mm')}</td>
                                      <td>{sale.orderId}</td>
                                      <td>
                                          {`${sale.customer?.name || ''} ${sale.customer?.lastName || ''}`.trim() || 'Cliente no registrado'}
                                          {sale.customer?.email && (
                                              <div className="text-muted small">{sale.customer.email}</div>
                                          )}
                                      </td>
                                      <td>
                                          {sale.items?.slice(0, 2).map((item, idx) => (
                                              <div key={idx} className="small">
                                                  {item.quantity}x {item.productName || 'Producto'}
                                              </div>
                                          ))}
                                          {sale.items?.length > 2 && (
                                              <div className="text-muted small">+{sale.items.length - 2} más</div>
                                          )}
                                      </td>
                                      <td className="text-nowrap">${sale.total?.toFixed(2) || '0.00'}</td>
                                      <td>
                                          <Button
                                              variant="outline-primary"
                                              size="sm"
                                              className="me-1 no-print"
                                              onClick={() => viewSaleDetails(sale)}
                                          >
                                              <FaEye/>
                                          </Button>
                                          <Button
                                              variant="outline-secondary"
                                              size="sm"
                                              className="no-print"
                                              onClick={() => window.print()}
                                          >
                                              <FaPrint/>
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
              </Card>

              {/* Modal de Detalles de Venta */}
              {selectedSale && (
                  <div className={`modal fade ${showDetails ? 'show d-block' : ''}`} tabIndex="-1"
                       style={{backgroundColor: showDetails ? 'rgba(0,0,0,0.5)' : 'transparent'}}>
                      <div className="modal-dialog modal-lg">
                          <div className="modal-content" id="sale-details">
                              <div className="modal-header">
                                  <h5 className="modal-title">Detalles de Venta</h5>
                                  <button
                                      type="button"
                                      className="btn-close no-print"
                                      onClick={() => setShowDetails(false)}
                                      aria-label="Cerrar"
                                  ></button>
                              </div>
                              <div className="modal-body">
                                  <div className="d-flex justify-content-end gap-2 mb-3 no-print">
                                      <Button
                                          variant="outline-primary"
                                          onClick={exportToPDF}
                                          className="print-button"
                                          size="sm"
                                      >
                                          <FaFilePdf className="me-1"/> Exportar PDF
                                      </Button>
                                      <Button
                                          variant="outline-secondary"
                                          onClick={handlePrint}
                                          className="print-button"
                                          size="sm"
                                      >
                                          <FaPrint className="me-1"/> Imprimir
                                      </Button>
                                      <Button
                                          variant="outline-danger"
                                          onClick={() => setShowDetails(false)}
                                          size="sm"
                                      >
                                          <FaTimes className="me-1"/> Cerrar
                                      </Button>
                                  </div>
                                  <Row className="mb-4">
                                      <Col md={6}>
                                          <h6>Información de la Venta</h6>
                                          <p className="mb-1"><strong>N° Orden:</strong> {selectedSale.orderId}</p>
                                          <p className="mb-1">
                                              <strong>Fecha:</strong> {format(new Date(selectedSale.date), 'PPPPp', {locale: es})}
                                          </p>
                                          <p className="mb-1"><strong>Estado:</strong> <Badge
                                              bg="success">Completada</Badge></p>
                                          <p className="mb-1"><strong>Método de
                                              pago:</strong> {selectedSale.paymentMethod || 'No especificado'}</p>
                                      </Col>
                                      <Col md={6}>
                                          <h6>Información del Cliente</h6>
                                          <p className="mb-1">
                                              <strong>Nombre:</strong> {`${selectedSale.customer?.name || ''} ${selectedSale.customer?.lastName || ''}`.trim() || 'Cliente no registrado'}
                                          </p>
                                          <p className="mb-1">
                                              <strong>Email:</strong> {selectedSale.customer?.email || 'No especificado'}
                                          </p>
                                          <p className="mb-1">
                                              <strong>Teléfono:</strong> {selectedSale.customer?.phone || 'No especificado'}
                                          </p>
                                          <p className="mb-0">
                                              <strong>Dirección:</strong> {
                                              [
                                                  selectedSale.customer?.address,
                                                  selectedSale.customer?.city,
                                                  selectedSale.customer?.region,
                                                  selectedSale.customer?.country
                                              ].filter(Boolean).join(', ') || 'No especificada'
                                          }
                                          </p>
                                      </Col>
                                  </Row>

                                  <div className="mt-4">
                                      <h6>Productos</h6>
                                      <Table striped bordered size="sm" className="mb-4">
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
                                                  <td>{item.productName || 'Producto no especificado'}</td>
                                                  <td className="text-center">{item.quantity || 1}</td>
                                                  <td className="text-end">${(item.price || 0).toFixed(2)}</td>
                                                  <td className="text-end">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                                              </tr>
                                          ))}
                                          </tbody>
                                          <tfoot>
                                          <tr>
                                              <td colSpan="3" className="text-end fw-bold">Subtotal:</td>
                                              <td className="text-end">${selectedSale.subtotal?.toFixed(2) || '0.00'}</td>
                                          </tr>
                                          <tr>
                                              <td colSpan="3" className="text-end fw-bold">Costo de envío:</td>
                                              <td className="text-end">${selectedSale.shippingCost?.toFixed(2) || '0.00'}</td>
                                          </tr>
                                          <tr>
                                              <td colSpan="3" className="text-end fw-bold">Total:</td>
                                              <td className="text-end fw-bold">${selectedSale.total?.toFixed(2) || '0.00'}</td>
                                          </tr>
                                          </tfoot>
                                      </Table>

                                      <div className="border-top pt-3 mt-4">
                                          <h6>Información Adicional</h6>
                                          <p className="mb-1"><strong>Método de
                                              Pago:</strong> {selectedSale.paymentMethod || 'No especificado'}</p>
                                          <p className="mb-1"><strong>Estado del Pago:</strong> <Badge
                                              bg="success">Completado</Badge></p>
                                          <p className="mb-1"><strong>Fecha de la
                                              Venta:</strong> {format(new Date(selectedSale.date), 'PPPPp', {locale: es})}
                                          </p>
                                          {selectedSale.deliveredAt && (
                                              <p className="mb-1"><strong>Entregado
                                                  el:</strong> {format(new Date(selectedSale.deliveredAt), 'PPPPp', {locale: es})}
                                              </p>
                                          )}
                                          {selectedSale.notes && (
                                              <div className="alert alert-info mt-2 mb-0">
                                                  <strong>Notas:</strong> {selectedSale.notes}
                                              </div>
                                          )}
                                      </div>
                                  </div>
                                  <div className="modal-footer">
                                      <Button variant="secondary" onClick={() => setShowDetails(false)}
                                              className="no-print">
                                          Cerrar
                                      </Button>
                                      <Button
                                          variant="outline-secondary"
                                          onClick={handlePrint}
                                          className="print-button"
                                          size="sm"
                                      >
                                          <FaPrint className="me-1"/> Imprimir
                                      </Button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
          </Container>
      );
  }
};

export default SalesManagement;
