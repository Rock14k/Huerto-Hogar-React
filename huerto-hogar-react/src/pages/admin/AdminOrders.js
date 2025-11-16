import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Table, 
  Badge, 
  Button, 
  Modal, 
  Row, 
  Col, 
  Card, 
  Form,
  Alert,
  ListGroup,
  ButtonGroup
} from 'react-bootstrap';
import { 
  FaSearch, 
  FaEye, 
  FaTrash, 
  FaFilePdf, 
  FaFileExcel, 
  FaFileCsv,
  FaChartLine
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { recordSale } from '../../utils/salesUtils';
import { Link } from 'react-router-dom';

const AdminOrders = () => {
  const { currentUser } = useAuth();
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load all orders from localStorage
  useEffect(() => {
    loadAllOrders();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadAllOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter orders when search term or status changes
  useEffect(() => {
    let result = [...allOrders];
    
    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Filter by search term (order ID or customer name/email)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.id.toLowerCase().includes(term) ||
        (order.customer?.name?.toLowerCase().includes(term)) ||
        (order.customer?.email?.toLowerCase().includes(term))
      );
    }
    
    setFilteredOrders(result);
  }, [allOrders, searchTerm, statusFilter]);

  const loadAllOrders = () => {
    try {
      // Get all keys from localStorage that start with 'orders_'
      const orderKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('orders_')) {
          orderKeys.push(key);
        }
      }
      
      const allOrdersList = [];
      
      orderKeys.forEach(key => {
        try {
          const userOrders = JSON.parse(localStorage.getItem(key) || '[]');
          // Filter out invalid or test orders
          const validOrders = userOrders.filter(order => 
            order.id && 
            (order.items?.length > 0) && 
            (order.total > 0) &&
            !order.id.startsWith('test-')
          );
          
          if (validOrders.length > 0) {
            const userId = key.replace('orders_', '');
            const ordersWithUserId = validOrders.map(order => ({
              ...order,
              userId,
              // Ensure all required fields have default values
              status: order.status || 'pending',
              createdAt: order.createdAt || new Date().toISOString(),
              total: order.total || 0,
              items: order.items || []
            }));
            allOrdersList.push(...ordersWithUserId);
          }
        } catch (e) {
          console.error(`Error parsing orders from ${key}:`, e);
        }
      });
      
      // Sort by date (newest first)
      const sortedOrders = allOrdersList.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setAllOrders(sortedOrders);
      setFilteredOrders(sortedOrders);
      
      // Clear any previous errors if loading succeeds
      if (sortedOrders.length > 0) {
        setError('');
      } else {
        setError('No se encontraron órdenes en el sistema.');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Error al cargar las órdenes. Por favor, intente recargar la página.');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Find the order to update
      const orderToUpdate = allOrders.find(order => order.id === orderId);
      if (!orderToUpdate) {
        throw new Error('Orden no encontrada');
      }
      
      // If changing to 'entregado', record the sale and update product stock
      if (newStatus === 'entregado' && orderToUpdate.status !== 'entregado') {
        // Get current products to update stock and sales counts
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        
        // Update product stock and sales counts
        const updatedProducts = products.map(product => {
          const orderItem = orderToUpdate.items.find(item => item.productId === product.id);
          if (orderItem) {
            return {
              ...product,
              stock: Math.max(0, (product.stock || 0) - (orderItem.quantity || 1)),
              purchaseCount: (product.purchaseCount || 0) + (orderItem.quantity || 1)
            };
          }
          return product;
        });
        
        // Save updated products back to localStorage
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        
        // Record the sale
        const saleRecord = {
          ...orderToUpdate,
          id: `sale_${Date.now()}`,
          status: 'completed',
          date: new Date().toISOString(),
          deliveredAt: new Date().toISOString(),
          // Add product names to sale items for better reporting
          items: orderToUpdate.items.map(item => ({
            ...item,
            productName: updatedProducts.find(p => p.id === item.productId)?.name || 'Producto no encontrado'
          }))
        };
        
        // Save sale to localStorage
        const sales = JSON.parse(localStorage.getItem('sales') || '[]');
        localStorage.setItem('sales', JSON.stringify([...sales, saleRecord]));
      }
      
      // Update the order status
      const updatedOrders = allOrders.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: newStatus,
              updatedAt: new Date().toISOString(),
              // Add status history if it doesn't exist
              statusHistory: [
                ...(order.statusHistory || []),
                {
                  status: newStatus,
                  date: new Date().toISOString(),
                  changedBy: currentUser?.email || 'admin',
                  // If this is the first time it's marked as delivered, record it
                  ...(newStatus === 'entregado' && !order.deliveredAt ? { deliveredAt: new Date().toISOString() } : {})
                }
              ],
              // If this is the first time it's marked as delivered, record it
              ...(newStatus === 'entregado' && !order.deliveredAt ? { deliveredAt: new Date().toISOString() } : {})
            } 
          : order
      );
      
      // Group orders by user for localStorage
      const ordersByUser = {};
      updatedOrders.forEach(order => {
        if (!ordersByUser[order.userId]) {
          ordersByUser[order.userId] = [];
        }
        const { userId, ...orderWithoutUserId } = order;
        ordersByUser[userId].push(orderWithoutUserId);
      });
      
      // Save back to localStorage
      Object.entries(ordersByUser).forEach(([userId, userOrders]) => {
        localStorage.setItem(`orders_${userId}`, JSON.stringify(userOrders));
      });
      
      setAllOrders(updatedOrders);
      
      // Show success message with specific text for delivered orders
      const successMessage = newStatus === 'entregado' 
        ? '¡Orden marcada como entregada! Las ventas han sido actualizadas.' 
        : 'Estado de la orden actualizado correctamente';
      
      setSuccess(successMessage);
      setTimeout(() => setSuccess(''), 3000);
      
      // Update selected order if it's the one being viewed
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({
          ...prev,
          status: newStatus,
          ...(newStatus === 'entregado' ? { deliveredAt: new Date().toISOString() } : {})
        }));
      }
    } catch (error) {
      setError('Error al actualizar el estado de la orden: ' + error.message);
    }
  };

  const deleteOrder = (orderId, userId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta orden? Esta acción no se puede deshacer.')) {
      try {
        // Remove from state
        const updatedOrders = allOrders.filter(order => order.id !== orderId);
        
        // Update localStorage
        const userOrders = updatedOrders
          .filter(order => order.userId === userId)
          .map(({ userId, ...order }) => order);
        
        localStorage.setItem(`orders_${userId}`, JSON.stringify(userOrders));
        
        setAllOrders(updatedOrders);
        
        // Close modal if the deleted order is open
        if (selectedOrder && selectedOrder.id === orderId) {
          setShowModal(false);
        }
        
        setSuccess('Orden eliminada correctamente');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Error al eliminar la orden: ' + error.message);
      }
    }
  };

  const handleViewOrder = (order) => {
    // Enrich order data before showing in modal
    const enrichedOrder = {
      ...order,
      // Format dates for display
      formattedDate: new Date(order.createdAt).toLocaleString(),
      // Calculate item total
      items: (order.items || []).map(item => ({
        ...item,
        total: (item.price || 0) * (item.quantity || 1)
      })),
      // Ensure shipping address exists
      shipping: order.shipping || {
        name: 'No especificada',
        address: 'No especificada',
        city: '',
        country: ''
      }
    };
    setSelectedOrder(enrichedOrder);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
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
      <h2 className="mb-4">Gestión de Órdenes</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <div className="input-group">
                  <Form.Control
                    type="text"
                    placeholder="Buscar por ID, nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline-secondary">
                    <FaSearch />
                  </Button>
                </div>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="procesando">Procesando</option>
                  <option value="enviado">Enviado</option>
                  <option value="entregado">Entregado</option>
                  <option value="cancelado">Cancelado</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-center">
              <div className="ms-auto">
                {filteredOrders.length} órdenes encontradas
              </div>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No se encontraron órdenes
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div>{order.customer?.name || 'Cliente'}</div>
                        <small className="text-muted">{order.customer?.email}</small>
                      </td>
                      <td>{formatCurrency(order.total)}</td>
                      <td>
                        <Badge 
                          bg={
                            order.status === 'entregado' ? 'success' :
                            order.status === 'cancelado' ? 'danger' :
                            order.status === 'enviado' ? 'info' :
                            order.status === 'procesando' ? 'warning' : 'secondary'
                          }
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => handleViewOrder(order)}
                          title="Ver detalles"
                        >
                          <FaEye />
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => deleteOrder(order.id, order.userId)}
                          title="Eliminar orden"
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Order Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalles de la Orden #{selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        {selectedOrder && (
          <>
            <Modal.Body>
              <Row className="mb-4">
                <Col md={6}>
                  <h5>Información del Cliente</h5>
                  <p className="mb-1"><strong>Nombre:</strong> {selectedOrder.customer?.name || 'No especificado'}</p>
                  <p className="mb-1"><strong>Email:</strong> {selectedOrder.customer?.email || 'No especificado'}</p>
                  <p className="mb-1"><strong>Teléfono:</strong> {selectedOrder.customer?.phone || 'No especificado'}</p>
                  <p className="mb-0">
                    <strong>Dirección:</strong> {selectedOrder.customer?.address?.street || 'No especificada'}, 
                    {selectedOrder.customer?.address?.city || ''} 
                    {selectedOrder.customer?.address?.region ? `, ${selectedOrder.customer.address.region}` : ''}
                  </p>
                </Col>
                <Col md={6}>
                  <h5>Información de la Orden</h5>
                  <p className="mb-1"><strong>Fecha:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  <p className="mb-1">
                    <strong>Estado:</strong>{' '}
                    <Form.Select
                      value={selectedOrder.status}
                      onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                      className="d-inline-block w-auto ms-2"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="procesando">Procesando</option>
                      <option value="enviado">Enviado</option>
                      <option value="entregado">Entregado</option>
                      <option value="cancelado">Cancelado</option>
                    </Form.Select>
                  </p>
                  <p className="mb-1"><strong>Método de pago:</strong> {selectedOrder.paymentMethod || 'No especificado'}</p>
                </Col>
              </Row>

              <h5 className="mt-3">Productos</h5>
              <ListGroup className="mb-3">
                {selectedOrder.items?.map((item, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-0">{item.name}</h6>
                      <small className="text-muted">Cantidad: {item.quantity}</small>
                    </div>
                    <div className="text-end">
                      <div>{formatCurrency(item.price)} c/u</div>
                      <div className="fw-bold">{formatCurrency(item.price * item.quantity)}</div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <div className="text-end">
                <p className="mb-1">Subtotal: {formatCurrency(selectedOrder.subtotal)}</p>
                {selectedOrder.shipping > 0 && (
                  <p className="mb-1">Envío: {formatCurrency(selectedOrder.shipping)}</p>
                )}
                {selectedOrder.discount > 0 && (
                  <p className="mb-1">Descuento: -{formatCurrency(selectedOrder.discount)}</p>
                )}
                <h5>Total: {formatCurrency(selectedOrder.total)}</h5>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cerrar
              </Button>
              <Button 
                variant="danger"
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que deseas eliminar esta orden? Esta acción no se puede deshacer.')) {
                    deleteOrder(selectedOrder.id, selectedOrder.userId);
                    handleCloseModal();
                  }
                }}
              >
                <FaTrash className="me-1" /> Eliminar Orden
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default AdminOrders;
