import React from 'react';
import { Container, Row, Col, Card, ListGroup, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';

const CartPage = () => {
    const { cart, cartTotal, cartCount, removeFromCart, updateQuantity } = useCart();
    const { t } = useTranslation();

    return (
        <Container className="py-5">
            <h1 className="mb-4">{t('cart.title', 'Carrito de Compras')}</h1>
            {cart.length === 0 ? (
                <div className="text-center py-5">
                    <h3>{t('cart.empty', 'Tu carrito está vacío')}</h3>
                    <p className="text-muted">{t('cart.continue_shopping', 'Agrega productos para continuar')}</p>
                    <Link to="/productos" className="btn btn-primary">
                        {t('cart.shop_now', 'Ver Productos')}
                    </Link>
                </div>
            ) : (
                <Row>
                    <Col lg={8}>
                        <Card className="shadow-sm mb-4">
                            <Card.Header className="fw-semibold">
                                {t('cart.your_items', 'Tus Productos')} ({cartCount})
                            </Card.Header>
                            <ListGroup variant="flush">
                                {cart.map((item) => (
                                    <ListGroup.Item key={item.id}>
                                        <Row className="align-items-center">
                                            <Col xs={3} md={2}>
                                                <img
                                                    src={item.image || '/placeholder-product.jpg'}
                                                    alt={item.name}
                                                    className="img-fluid rounded"
                                                    style={{ maxHeight: '80px' }}
                                                />
                                            </Col>
                                            <Col xs={9} md={6}>
                                                <h5 className="mb-1">{item.name}</h5>
                                                <p className="mb-1 text-muted small">
                                                    ${item.price.toLocaleString()} c/u
                                                </p>
                                            </Col>
                                            <Col xs={6} md={2} className="mt-2 mt-md-0">
                                                <div className="d-flex align-items-center">
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        -
                                                    </Button>
                                                    <span className="mx-2">{item.quantity}</span>
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        +
                                                    </Button>
                                                </div>
                                            </Col>
                                            <Col xs={4} md={1} className="text-end">
                                                <Button
                                                    variant="link"
                                                    className="text-danger p-0"
                                                    onClick={() => removeFromCart(item.id)}
                                                    aria-label="Eliminar"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            </Col>
                                            <Col xs={2} className="text-end fw-bold d-none d-md-block">
                                                ${(item.price * item.quantity).toLocaleString()}
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card>
                    </Col>
                    <Col lg={4}>
                        <Card className="shadow-sm">
                            <Card.Header className="fw-semibold">
                                {t('cart.order_summary', 'Resumen del Pedido')}
                            </Card.Header>
                            <ListGroup variant="flush">
                                <ListGroup.Item className="d-flex justify-content-between">
                                    <span>{t('cart.subtotal', 'Subtotal')}</span>
                                    <span>${cartTotal.toLocaleString()}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between">
                                    <span>{t('cart.shipping', 'Envío')}</span>
                                    <span>{t('cart.calculated_at_checkout', 'Se calcula en el pago')}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between fw-bold fs-5">
                                    <span>{t('cart.total', 'Total')}</span>
                                    <span>${cartTotal.toLocaleString()}</span>
                                </ListGroup.Item>
                            </ListGroup>
                            <Card.Body>
                                <Button
                                    as={Link}
                                    to="/checkout"
                                    variant="primary"
                                    className="w-100"
                                    disabled={cart.length === 0}
                                >
                                    {t('cart.proceed_to_checkout', 'Proceder al Pago')}
                                </Button>
                                <div className="text-center mt-2">
                                    <small className="text-muted">
                                        {t('cart.or', 'o')}{' '}
                                        <Link to="/productos" className="text-decoration-none">
                                            {t('cart.continue_shopping', 'Seguir Comprando')}
                                        </Link>
                                    </small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default CartPage;