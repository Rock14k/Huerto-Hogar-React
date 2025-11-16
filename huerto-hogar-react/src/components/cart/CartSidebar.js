import React from 'react';
import { Offcanvas, Button, ListGroup, Badge, Form, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faTrash, faMinus, faPlus, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CartSidebar = () => {
  const { 
    cart, 
    isCartOpen, 
    toggleCart, 
    removeFromCart, 
    updateQuantity, 
    cartTotal, 
    cartCount,
    clearCart
  } = useCart();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleQuantityChange = (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  return (
    <Offcanvas 
      show={isCartOpen} 
      onHide={toggleCart} 
      placement="end" 
      className="cart-sidebar"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title className="fw-bold">
          Tu Carrito {cartCount > 0 && `(${cartCount})`}
        </Offcanvas.Title>
      </Offcanvas.Header>
      
      <Offcanvas.Body className="d-flex flex-column">
        {cart.length === 0 ? (
          <div className="text-center my-5">
            <div className="mb-3">
              <FontAwesomeIcon 
                icon={faShoppingBag} 
                size="3x" 
                className="text-muted"
              />
            </div>
            <h5>Tu carrito está vacío</h5>
            <p className="text-muted">
              Añade productos a tu carrito para continuar con la compra
            </p>
            <Button 
              variant="primary" 
              className="mt-3"
              onClick={() => { navigate('/productos'); toggleCart(); }}
            >
              Seguir comprando
            </Button>
          </div>
        ) : (
          <>
            <ListGroup variant="flush" className="mb-3 flex-grow-1">
              {cart.map((item) => (
                <ListGroup.Item key={item.id} className="border-0 border-bottom py-3">
                  <Row className="align-items-center">
                    <Col xs={3}>
                      <img 
                        src={item.image || '/static/img/product-placeholder.jpg'} 
                        alt={item.name}
                        className="img-fluid rounded"
                      />
                    </Col>
                    <Col xs={9}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{item.name}</h6>
                          <p className="text-muted mb-1">${item.price.toLocaleString()}</p>
                        </div>
                        <Button 
                          variant="link" 
                          className="text-danger p-0"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </div>
                      
                      <div className="d-flex align-items-center mt-2">
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          className="px-2 py-0"
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                        >
                          <FontAwesomeIcon icon={faMinus} size="xs" />
                        </Button>
                        
                        <Form.Control 
                          type="number" 
                          value={item.quantity} 
                          min="1"
                          className="mx-2 text-center"
                          style={{ width: '50px' }}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        />
                        
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          className="px-2 py-0"
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                        >
                          <FontAwesomeIcon icon={faPlus} size="xs" />
                        </Button>
                        
                        <div className="ms-auto fw-bold">
                          ${(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
            
            <div className="border-top pt-3">
              <div className="d-flex justify-content-between mb-3">
                <span>Subtotal ({cartCount} {cartCount === 1 ? 'producto' : 'productos'})</span>
                <span className="fw-bold">${cartTotal.toLocaleString()}</span>
              </div>
              
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  size="lg"
                  className="mb-2"
                  onClick={() => { if (!currentUser) { navigate('/iniciar-sesion'); return; } toggleCart(); navigate('/checkout'); }}
                >
                  Finalizar compra
                </Button>
                
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={clearCart}
                >
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  Vaciar carrito
                </Button>

                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => { navigate('/productos'); toggleCart(); }}
                >
                  Seguir comprando
                </Button>
              </div>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default CartSidebar;
