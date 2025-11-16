import React, { useMemo, useState } from 'react';
import { Container, Row, Col, Card, ListGroup, Form, Button, Badge } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Checkout = () => {
  const { cart, cartTotal, cartCount, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const profileExtra = useMemo(() => {
    try {
      const raw = localStorage.getItem('user_profile_extra');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);

  const defaultAddress = useMemo(() => {
    const addr = profileExtra?.address || {};
    const parts = [addr.street, addr.comuna, addr.region, profileExtra?.country || addr.country].filter(Boolean);
    return parts.join(', ');
  }, [profileExtra]);

  const [address, setAddress] = useState(defaultAddress);
  const [payment, setPayment] = useState('Tarjeta');
  const [notes, setNotes] = useState('');

  const canConfirm = cart.length > 0 && address.trim().length >= 5;

  const confirmOrder = () => {
    if (!currentUser) { navigate('/iniciar-sesion'); return; }
    if (!canConfirm) { alert('Completa la dirección para continuar.'); return; }
    const order = {
      id: 'ORD-' + Date.now(),
      items: cart,
      total: cartTotal,
      count: cartCount,
      createdAt: new Date().toISOString(),
      status: payment === 'Transferencia' ? 'Creada' : 'Pagada',
      paymentMethod: payment,
      shippingAddress: address,
      notes: notes?.trim() || ''
    };
    const key = `orders_${currentUser.uid}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.unshift(order);
    localStorage.setItem(key, JSON.stringify(existing));
    clearCart();
    navigate('/historial-compras');
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4">{t('checkout.title')}</h1>
      <Row className="g-4">
        <Col lg={7}>
          <Card className="shadow-sm">
            <Card.Header className="fw-semibold">{t('checkout.shipping_address')}</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>{t('checkout.full_address')}</Form.Label>
                <Form.Control as="textarea" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t('checkout.address_placeholder')} />
                <Form.Text className="text-muted">
                  {t('checkout.address_hint')} <Link to="/perfil">{t('checkout.update_profile_address')}</Link>.
                </Form.Text>
              </Form.Group>

              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t('checkout.payment_method')}</Form.Label>
                    <Form.Select value={payment} onChange={(e) => setPayment(e.target.value)}>
                      <option>{t('checkout.pay_card')}</option>
                      <option>{t('checkout.pay_transfer')}</option>
                      <option>{t('checkout.pay_cod')}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6} className="d-flex align-items-end">
                  <Badge bg="info" className="ms-md-auto">
                    {payment === 'Transferencia' ? t('checkout.badge_transfer') : payment === 'Contraentrega' ? t('checkout.badge_cod') : t('checkout.badge_card')}
                  </Badge>
                </Col>
              </Row>

              <Form.Group className="mt-3">
                <Form.Label>{t('checkout.order_notes')}</Form.Label>
                <Form.Control as="textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('checkout.notes_placeholder')} />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="shadow-sm">
            <Card.Header className="fw-semibold">{t('checkout.summary')}</Card.Header>
            <ListGroup variant="flush">
              {cart.map((it) => (
                <ListGroup.Item key={it.id} className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold">{it.name}</div>
                    <div className="text-muted small">x{it.quantity} · ${it.price.toLocaleString()}</div>
                  </div>
                  <div className="fw-bold">${(it.price * it.quantity).toLocaleString()}</div>
                </ListGroup.Item>
              ))}
              <ListGroup.Item className="d-flex justify-content-between">
                <span>{t('checkout.subtotal')} ({cartCount})</span>
                <span className="fw-bold">${cartTotal.toLocaleString()}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>{t('checkout.shipping')}</span>
                <span>$0</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>{t('checkout.total')}</span>
                <span className="fw-bold">${cartTotal.toLocaleString()}</span>
              </ListGroup.Item>
            </ListGroup>
            <Card.Body>
              <Button className="w-100" size="lg" onClick={confirmOrder} disabled={!canConfirm}>
                {t('checkout.confirm_order')}
              </Button>
              {!canConfirm && (
                <div className="text-muted small mt-2">{t('checkout.complete_address_msg')}</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
;

export default Checkout;
