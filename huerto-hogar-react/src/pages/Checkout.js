import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, Alert } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Checkout = () => {
  const { cart, cartTotal, cartCount, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    postalCode: '',
    shippingMethod: 'standard',
    paymentMethod: 'credit',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    couponCode: ''
  });

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const loadUserData = () => {
      if (currentUser) {
        try {
          // Obtener datos del perfil del usuario desde localStorage
          const userProfile = JSON.parse(localStorage.getItem('user_profile_extra') || '{}');
          const userAddress = userProfile.address || {};
          
          // Actualizar el estado con los datos del usuario
          setFormData(prev => ({
            ...prev,
            firstName: userProfile.firstName || currentUser.displayName?.split(' ')[0] || '',
            lastName: userProfile.lastName || currentUser.displayName?.split(' ').slice(1).join(' ') || '',
            email: currentUser.email || userProfile.email || '',
            phone: userProfile.phone || userProfile.phoneNumber || '',
            address: userAddress.street || userProfile.street || '',
            city: userAddress.city || userProfile.comuna || '',
            region: userAddress.region || userProfile.region || '',
            postalCode: userAddress.postalCode || ''
          }));
        } catch (error) {
          console.error('Error al cargar los datos del usuario:', error);
          // En caso de error, cargar al menos el email del usuario autenticado
          setFormData(prev => ({
            ...prev,
            email: currentUser.email || ''
          }));
        }
      }
    };

    loadUserData();
  }, [currentUser]);

  const [shippingCost, setShippingCost] = useState(0);
  const [showCardForm, setShowCardForm] = useState(true);
  const [couponMessage, setCouponMessage] = useState({ text: '', type: '' });
  const [discount, setDiscount] = useState(0);

  // Calcular costo de envío
  useEffect(() => {
    let cost = 0;
    if (formData.shippingMethod === 'express') {
      cost = 3500;
    } else if (formData.shippingMethod === 'standard' && cartTotal < 15000) {
      cost = 0;
    }
    setShippingCost(cost);
  }, [formData.shippingMethod, cartTotal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Mostrar/ocultar formulario de tarjeta según método de pago
    if (name === 'paymentMethod') {
      setShowCardForm(value === 'credit');
    }
  };

  const handleCouponApply = () => {
    // Lógica simple de cupón (en producción validar contra backend)
    if (formData.couponCode.toUpperCase() === 'DESCUENTO10') {
      setDiscount(cartTotal * 0.1); // 10% de descuento
      setCouponMessage({
        text: '¡Cupón aplicado correctamente!',
        type: 'success'
      });
    } else {
      setCouponMessage({
        text: 'Cupón no válido',
        type: 'danger'
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validar formulario
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || 
        !formData.address || !formData.city || !formData.region) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }
    
    if (formData.paymentMethod === 'credit' && 
        (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardName)) {
      alert('Por favor completa la información de la tarjeta');
      return;
    }

    // Crear el pedido
    const order = {
      id: 'ORD-' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'Completado',
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
      })),
      subtotal: cartTotal,
      shipping: shippingCost,
      discount: discount,
      total: cartTotal + shippingCost - discount,
      customer: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        address: {
          street: formData.address,
          city: formData.city,
          region: formData.region,
          postalCode: formData.postalCode
        }
      },
      paymentMethod: formData.paymentMethod
    };

    // Guardar el pedido en el historial
    if (currentUser) {
      const key = `orders_${currentUser.uid}`;
      const existingOrders = JSON.parse(localStorage.getItem(key) || '[]');
      existingOrders.unshift(order); // Agregar el nuevo pedido al principio
      localStorage.setItem(key, JSON.stringify(existingOrders));
    }

    // Limpiar el carrito
    clearCart();
    
    // Redirigir al historial de compras después de completar la compra
    navigate('/historial-compras');
  };

  const totalAmount = cartTotal + shippingCost - discount;

  return (
    <div className="bg-light py-5">
      <Container>
        <h2 className="text-center mb-5">Finalizar Compra</h2>
        
        <form onSubmit={handleSubmit}>
          <Row className="g-5">
            {/* Columna Izquierda - Formulario */}
            <Col lg={8}>
              {/* Información de Envío */}
              <Card className="mb-4">
                <Card.Header className="bg-white">
                  <h5><i className="fas fa-shipping-fast me-2"></i>Información de Envío</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Nombre *</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="firstName" 
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Apellido *</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="lastName" 
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Email *</Form.Label>
                        <Form.Control 
                          type="email" 
                          name="email" 
                          value={formData.email}
                          onChange={handleInputChange}
                          required 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Teléfono *</Form.Label>
                        <Form.Control 
                          type="tel" 
                          name="phone" 
                          value={formData.phone}
                          onChange={handleInputChange}
                          required 
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label>Dirección *</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="address" 
                          value={formData.address}
                          onChange={handleInputChange}
                          required 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Ciudad *</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="city" 
                          value={formData.city}
                          onChange={handleInputChange}
                          required 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Región *</Form.Label>
                        <Form.Select 
                          name="region" 
                          value={formData.region}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Seleccionar región</option>
                          <option value="metropolitana">Región Metropolitana</option>
                          <option value="valparaiso">Valparaíso</option>
                          <option value="ohiggins">O'Higgins</option>
                          <option value="maule">Maule</option>
                          <option value="biobio">Biobío</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Código Postal</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="postalCode" 
                          value={formData.postalCode}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Método de Envío */}
              <Card className="mb-4">
                <Card.Header className="bg-white">
                  <h5><i className="fas fa-truck me-2"></i>Método de Envío</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <Form.Check>
                      <Form.Check.Input 
                        type="radio" 
                        name="shippingMethod" 
                        id="standardShipping"
                        value="standard"
                        checked={formData.shippingMethod === 'standard'}
                        onChange={handleInputChange}
                        className="me-2"
                      />
                      <Form.Check.Label className="w-100">
                        <div className="d-flex justify-content-between">
                          <div>
                            <strong>Envío Estándar (3-5 días hábiles)</strong>
                            <div className="text-muted">Gratis en compras sobre $15.000</div>
                          </div>
                          <span>{shippingCost === 0 ? 'Gratis' : `$${shippingCost.toLocaleString()}`}</span>
                        </div>
                      </Form.Check.Label>
                    </Form.Check>
                  </div>
                  <div className="mb-3">
                    <Form.Check>
                      <Form.Check.Input 
                        type="radio" 
                        name="shippingMethod" 
                        id="expressShipping"
                        value="express"
                        checked={formData.shippingMethod === 'express'}
                        onChange={handleInputChange}
                        className="me-2"
                      />
                      <Form.Check.Label className="w-100">
                        <div className="d-flex justify-content-between">
                          <div>
                            <strong>Envío Express (1-2 días hábiles)</strong>
                            <div className="text-muted">Entrega rápida y segura</div>
                          </div>
                          <span>$3.500</span>
                        </div>
                      </Form.Check.Label>
                    </Form.Check>
                  </div>
                  <div>
                    <Form.Check>
                      <Form.Check.Input 
                        type="radio" 
                        name="shippingMethod" 
                        id="pickupShipping"
                        value="pickup"
                        checked={formData.shippingMethod === 'pickup'}
                        onChange={handleInputChange}
                        className="me-2"
                      />
                      <Form.Check.Label className="w-100">
                        <div className="d-flex justify-content-between">
                          <div>
                            <strong>Retiro en Tienda</strong>
                            <div className="text-muted">Av. España Nº8, Santiago</div>
                          </div>
                          <span>Gratis</span>
                        </div>
                      </Form.Check.Label>
                    </Form.Check>
                  </div>
                </Card.Body>
              </Card>

              {/* Método de Pago */}
              <Card className="mb-4">
                <Card.Header className="bg-white">
                  <h5><i className="far fa-credit-card me-2"></i>Método de Pago</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <Form.Check>
                      <Form.Check.Input 
                        type="radio" 
                        name="paymentMethod" 
                        id="creditCard"
                        value="credit"
                        checked={formData.paymentMethod === 'credit'}
                        onChange={handleInputChange}
                        className="me-2"
                      />
                      <Form.Check.Label>
                        <i className="far fa-credit-card me-2"></i>Tarjeta de Crédito/Débito
                      </Form.Check.Label>
                    </Form.Check>
                  </div>
                  
                  {showCardForm && (
                    <div className="ps-4 mt-3">
                      <Row className="g-3">
                        <Col xs={12}>
                          <Form.Group>
                            <Form.Label>Número de Tarjeta *</Form.Label>
                            <Form.Control 
                              type="text" 
                              name="cardNumber" 
                              value={formData.cardNumber}
                              onChange={handleInputChange}
                              placeholder="1234 5678 9012 3456"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Fecha de Vencimiento *</Form.Label>
                            <Form.Control 
                              type="text" 
                              name="expiryDate" 
                              value={formData.expiryDate}
                              onChange={handleInputChange}
                              placeholder="MM/AA"
                              maxLength={5}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>CVV *</Form.Label>
                            <Form.Control 
                              type="text" 
                              name="cvv" 
                              value={formData.cvv}
                              onChange={handleInputChange}
                              placeholder="123"
                              maxLength={3}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col xs={12}>
                          <Form.Group>
                            <Form.Label>Nombre en la Tarjeta *</Form.Label>
                            <Form.Control 
                              type="text" 
                              name="cardName" 
                              value={formData.cardName}
                              onChange={handleInputChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  )}

                  <div className="mt-3">
                    <Form.Check>
                      <Form.Check.Input 
                        type="radio" 
                        name="paymentMethod" 
                        id="transfer"
                        value="transfer"
                        checked={formData.paymentMethod === 'transfer'}
                        onChange={handleInputChange}
                        className="me-2"
                      />
                      <Form.Check.Label>
                        <i className="fas fa-university me-2"></i>Transferencia Bancaria
                      </Form.Check.Label>
                    </Form.Check>
                  </div>

                  <div className="mt-3">
                    <Form.Check>
                      <Form.Check.Input 
                        type="radio" 
                        name="paymentMethod" 
                        id="cash"
                        value="cash"
                        checked={formData.paymentMethod === 'cash'}
                        onChange={handleInputChange}
                        className="me-2"
                      />
                      <Form.Check.Label>
                        <i className="fas fa-money-bill-wave me-2"></i>Pago Contra Entrega
                      </Form.Check.Label>
                    </Form.Check>
                  </div>
                </Card.Body>
              </Card>

              {/* Cupón de Descuento */}
              <Card className="mb-4">
                <Card.Header className="bg-white">
                  <h5><i className="fas fa-ticket-alt me-2"></i>Cupón de Descuento</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="g-2">
                    <Col xs={8}>
                      <Form.Control 
                        type="text" 
                        name="couponCode" 
                        value={formData.couponCode}
                        onChange={handleInputChange}
                        placeholder="Ingresa tu código de cupón"
                      />
                      {couponMessage.text && (
                        <div className={`small ${couponMessage.type === 'success' ? 'text-success' : 'text-danger'} mt-1`}>
                          {couponMessage.text}
                        </div>
                      )}
                    </Col>
                    <Col xs={4}>
                      <Button 
                        variant="outline-primary" 
                        className="w-100"
                        onClick={handleCouponApply}
                        type="button"
                      >
                        Aplicar
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            {/* Columna Derecha - Resumen del Pedido */}
            <Col lg={4}>
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-white">
                  <h5 className="mb-0"><i className="fas fa-shopping-cart me-2"></i>Resumen del Pedido</h5>
                </Card.Header>
                <ListGroup variant="flush">
                  {cart.map(item => (
                    <ListGroup.Item key={item.id} className="d-flex justify-content-between">
                      <div>
                        <div className="fw-semibold">{item.name}</div>
                        <small className="text-muted">x{item.quantity}</small>
                      </div>
                      <div className="text-end">
                        <div>${(item.price * item.quantity).toLocaleString()}</div>
                        <small className="text-muted">${item.price.toLocaleString()} c/u</small>
                      </div>
                    </ListGroup.Item>
                  ))}
                  
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Subtotal:</span>
                    <span>${cartTotal.toLocaleString()}</span>
                  </ListGroup.Item>
                  
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Envío:</span>
                    <span>{shippingCost === 0 ? 'Gratis' : `$${shippingCost.toLocaleString()}`}</span>
                  </ListGroup.Item>
                  
                  {discount > 0 && (
                    <ListGroup.Item className="d-flex justify-content-between text-success">
                      <span>Descuento:</span>
                      <span>-${discount.toLocaleString()}</span>
                    </ListGroup.Item>
                  )}
                  
                  <ListGroup.Item className="d-flex justify-content-between fw-bold fs-5">
                    <span>Total:</span>
                    <span>${totalAmount.toLocaleString()}</span>
                  </ListGroup.Item>
                </ListGroup>
                
                <Card.Body>
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-100 mb-3"
                    type="submit"
                  >
                    <i className="fas fa-lock me-2"></i>Realizar Pedido
                  </Button>
                  
                  <div className="text-center">
                    <small className="text-muted">
                      <i className="fas fa-shield-alt me-1"></i>
                      Tu información está protegida con encriptación SSL
                    </small>
                  </div>
                </Card.Body>
              </Card>
              
              <div className="text-center">
                <img 
                  src="/img/payment-methods.png" 
                  alt="Métodos de pago" 
                  className="img-fluid"
                  style={{ maxWidth: '250px' }}
                />
              </div>
            </Col>
          </Row>
        </form>
      </Container>
    </div>
  );
};

export default Checkout;
