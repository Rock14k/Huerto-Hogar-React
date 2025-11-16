import React, { useMemo, useState } from 'react';
import { Container, Card, ListGroup, Badge, Button, Modal, Table, Row, Col, Form, Pagination } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../utils/auth'; // Asegúrate de que esta utilidad exista
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const OrderHistory = () => {
  const { currentUser } = useAuth();
  const keyForUser = currentUser ? `orders_${currentUser.uid}` : null;
  
  // Estado para las órdenes
  const [orders, setOrders] = useState(() => {
    if (!currentUser) return [];
    return JSON.parse(localStorage.getItem(keyForUser) || '[]');
  });
  
  const isUserAdmin = isAdmin(currentUser);
  const [selected, setSelected] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortKey, setSortKey] = useState('date'); // 'date' | 'total'
  const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'
  const { t } = useTranslation();

  const filtered = useMemo(() => {
    const start = fromDate ? new Date(fromDate + 'T00:00:00') : null;
    const end = toDate ? new Date(toDate + 'T23:59:59') : null;
    return (orders || []).filter(o => {
      const d = new Date(o.createdAt);
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
  }, [orders, fromDate, toDate]);

  const searched = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return filtered;
    return filtered.filter(o => o.id.toLowerCase().includes(q));
  }, [filtered, query]);

  const sorted = useMemo(() => {
    const arr = [...searched];
    arr.sort((a, b) => {
      let av, bv;
      if (sortKey === 'total') { av = a.total; bv = b.total; }
      else { av = new Date(a.createdAt).getTime(); bv = new Date(b.createdAt).getTime(); }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [searched, sortKey, sortDir]);

  const paginated = useMemo(() => {
    const startIdx = (page - 1) * pageSize;
    return sorted.slice(startIdx, startIdx + pageSize);
  }, [sorted, page, pageSize]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(searched.length / pageSize)), [searched, pageSize]);

  const deleteOrder = (id) => {
    if (!keyForUser || !window.confirm('¿Estás seguro de que deseas eliminar esta orden? Esta acción no se puede deshacer.')) {
      return;
    }
    
    // Obtener las órdenes actuales
    const currentOrders = [...orders]; // Hacer una copia del estado actual
    
    // Filtrar la orden a eliminar
    const remaining = currentOrders.filter(o => o.id !== id);
    
    // Actualizar el estado local
    setOrders(remaining);
    
    // Guardar en localStorage
    localStorage.setItem(keyForUser, JSON.stringify(remaining));
    
    // Cerrar el modal si la orden eliminada es la que se está mostrando
    if (selected?.id === id) {
      setSelected(null);
    }
    
    // Mostrar mensaje de éxito
    alert('La orden ha sido eliminada correctamente');
  };

  const exportAllCsv = (ordersList) => {
    if (!ordersList || ordersList.length === 0) return;
    const headers = ['OrdenID', 'Fecha', 'Producto', 'Cantidad', 'Precio', 'Subtotal', 'TotalOrden'];
    const lines = [headers.join(',')];
    ordersList.forEach(o => {
      o.items.forEach(it => {
        lines.push([
          escapeCsv(o.id),
          escapeCsv(new Date(o.createdAt).toLocaleString()),
          escapeCsv(it.name),
          it.quantity,
          it.price,
          it.price * it.quantity,
          o.total
        ].map(v => typeof v === 'string' ? v : String(v)).join(','));
      });
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historial_compras.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = (order) => {
    if (!order) return;
    const headers = ['Producto', 'Cantidad', 'Precio', 'Subtotal'];
    const rows = order.items.map(it => [
      escapeCsv(it.name),
      it.quantity,
      it.price,
      it.price * it.quantity
    ]);
    const totalRow = ['TOTAL', '', '', order.total];
    const csv = [headers, ...rows, totalRow]
      .map(r => r.map(c => typeof c === 'string' ? c : String(c)).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${order.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const escapeCsv = (val) => {
    if (val == null) return '';
    const s = String(val);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };

  const printOrder = (order) => {
    if (!order) return;
    const win = window.open('', '_blank');
    const rows = order.items.map(it => `
      <tr>
        <td>${it.name}</td>
        <td style="text-align:center;">${it.quantity}</td>
        <td style="text-align:right;">$${it.price.toLocaleString()}</td>
        <td style="text-align:right;">$${(it.price * it.quantity).toLocaleString()}</td>
      </tr>
    `).join('');
    win.document.write(`
      <html><head><title>${order.id}</title>
        <style>
          body{font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding:16px}
          h2{margin:0 0 8px}
          .muted{color:#666;margin-bottom:12px}
          table{width:100%;border-collapse:collapse}
          th,td{border:1px solid #ddd;padding:8px}
          th{text-align:left;background:#f7f7f7}
          tfoot td{font-weight:700}
        </style>
      </head><body>
        <h2>Orden ${order.id}</h2>
        <div class="muted">Fecha: ${new Date(order.createdAt).toLocaleString()}</div>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th style="text-align:center;">Cantidad</th>
              <th style="text-align:right;">Precio</th>
              <th style="text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align:right;">Total</td>
              <td style="text-align:right;">$${order.total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <Container className="py-5">
      <h1 className="mb-3">{t('orders.title', 'Historial de Compras')}</h1>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="g-2 align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label>{t('orders.from', 'Desde')}</Form.Label>
                <Form.Control type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>{t('orders.to', 'Hasta')}</Form.Label>
                <Form.Control type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={4} className="mt-2 mt-md-0">
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" onClick={() => { setFromDate(''); setToDate(''); }}>{t('orders.clear_filters', 'Limpiar filtros')}</Button>
                <Button as={Link} to="/productos" variant="primary">{t('orders.keep_shopping', 'Seguir comprando')}</Button>
                <Button variant="outline-success" onClick={() => exportAllCsv(filtered)}>{t('orders.export_all', 'Exportar todo (CSV)')}</Button>
              </div>
            </Col>
          </Row>
          <Row className="g-2 align-items-end mt-2">
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('orders.search_by_id', 'Buscar por ID')}</Form.Label>
                <Form.Control
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  placeholder={t('orders.search_placeholder', 'Ej: ORD-169879...')}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>{t('orders.page_size', 'Resultados por página')}</Form.Label>
                <Form.Select value={pageSize} onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1); }}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Row className="g-2">
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label>{t('orders.sort_by', 'Ordenar por')}</Form.Label>
                    <Form.Select value={sortKey} onChange={(e) => { setSortKey(e.target.value); setPage(1); }}>
                      <option value="date">{t('orders.date', 'Fecha')}</option>
                      <option value="total">{t('orders.total', 'Total')}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label>{t('orders.direction', 'Dirección')}</Form.Label>
                    <Form.Select value={sortDir} onChange={(e) => { setSortDir(e.target.value); setPage(1); }}>
                      <option value="asc">{t('orders.asc', 'Ascendente')}</option>
                      <option value="desc">{t('orders.desc', 'Descendente')}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <div className="small text-muted mt-1">{searched.length} {t('orders.found', 'orden(es) encontrada(s)')}</div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {(!paginated || paginated.length === 0) ? (
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <h5 className="mb-2">{t('orders.no_orders', 'Aún no tienes compras')}</h5>
            <p className="text-muted mb-4">{t('orders.no_orders_hint', 'Explora nuestros productos y realiza tu primera compra.')}</p>
            <Button as={Link} to="/productos" variant="primary">{t('orders.go_products', 'Ir a Productos')}</Button>
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <ListGroup variant="flush">
            {paginated.map((o) => (
              <ListGroup.Item key={o.id} className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="fw-semibold">{o.id}</div>
                  <div className="text-muted small">{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <Badge bg={o.status === 'Enviada' ? 'primary' : o.status === 'Pagada' ? 'success' : 'secondary'}>{t(`orders.status_${(o.status||'Creada').toLowerCase()}`, o.status || 'Creada')}</Badge>
                  <Badge bg="success">{o.count} {o.count === 1 ? 'artículo' : 'artículos'}</Badge>
                  <div className="fw-bold">${o.total.toLocaleString()}</div>
                  {isUserAdmin ? (
                    <Form.Select size="sm" style={{width: 140}}
                      value={o.status || 'Creada'}
                      onChange={(e) => {
                        if (!keyForUser) return;
                        const updated = (orders || []).map(ord => ord.id === o.id ? { ...ord, status: e.target.value } : ord);
                        localStorage.setItem(keyForUser, JSON.stringify(updated));
                        setPage(p => p); // re-render
                      }}
                    >
                      <option value="Creada">{t('orders.status_creada', 'Creada')}</option>
                      <option value="Pagada">{t('orders.status_pagada', 'Pagada')}</option>
                      <option value="Enviada">{t('orders.status_enviada', 'Enviada')}</option>
                    </Form.Select>
                  ) : (
                    <span className="badge bg-secondary">{o.status || 'Creada'}</span>
                  )}
                  <Button size="sm" variant="outline-primary" onClick={() => setSelected(o)}>{t('orders.view_detail', 'Ver detalle')}</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => deleteOrder(o.id)}>{t('orders.delete', 'Eliminar')}</Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
          <Card.Footer className="d-flex justify-content-center">
            <Pagination className="mb-0">
              <Pagination.First disabled={page===1} onClick={() => setPage(1)} />
              <Pagination.Prev disabled={page===1} onClick={() => setPage(p => Math.max(1, p-1))} />
              <Pagination.Item active>{page}</Pagination.Item>
              <Pagination.Next disabled={page===totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))} />
              <Pagination.Last disabled={page===totalPages} onClick={() => setPage(totalPages)} />
            </Pagination>
          </Card.Footer>
        </Card>
      )}

      <Modal show={!!selected} onHide={() => setSelected(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('orders.detail_title', 'Detalle de Orden')} {selected?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <>
              <div className="row mb-3">
                <div className="col-md-6">
                  <h5>Información del Pedido</h5>
                  <div className="mb-2"><strong>{t('orders.date', 'Fecha')}:</strong> <span className="text-muted">{new Date(selected.createdAt).toLocaleString()}</span></div>
                  <div className="mb-2">
                    <strong>{t('orders.status', 'Estado')}:</strong> 
                    <Badge bg={selected.status === 'Enviada' ? 'primary' : selected.status === 'Pagada' ? 'success' : 'secondary'} className="ms-2">
                      {t(`orders.status_${(selected.status||'Creada').toLowerCase()}`, selected.status || 'Creada')}
                    </Badge>
                  </div>
                  {selected.paymentMethod && (
                    <div className="mb-2">
                      <strong>{t('orders.payment_method', 'Método de pago')}:</strong>
                      <span className="text-muted ms-2">
                        {selected.paymentMethod === 'credit' ? 'Tarjeta de Crédito/Débito' : 
                         selected.paymentMethod === 'transfer' ? 'Transferencia Bancaria' : 
                         'Pago Contra Entrega'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  <h5>Datos del Cliente</h5>
                  {selected.customer?.name && (
                    <div className="mb-1"><strong>Nombre:</strong> <span className="text-muted">{selected.customer.name}</span></div>
                  )}
                  {selected.customer?.email && (
                    <div className="mb-1"><strong>Email:</strong> <span className="text-muted">{selected.customer.email}</span></div>
                  )}
                  {selected.customer?.phone && (
                    <div className="mb-1"><strong>Teléfono:</strong> <span className="text-muted">{selected.customer.phone}</span></div>
                  )}
                  {selected.customer?.address && (
                    <div className="mb-1">
                      <strong>Dirección:</strong>
                      <div className="text-muted ms-2">
                        {selected.customer.address.street}<br/>
                        {selected.customer.address.city}, {selected.customer.address.region}<br/>
                        {selected.customer.address.postalCode}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <hr/>
              {selected.notes && (
                <div className="mb-3"><strong>{t('orders.notes', 'Notas')}:</strong> <span className="text-muted">{selected.notes}</span></div>
              )}
              <Table responsive bordered hover>
                <thead>
                  <tr>
                    <th>{t('orders.col_product', 'Producto')}</th>
                    <th className="text-center">{t('orders.col_qty', 'Cantidad')}</th>
                    <th className="text-end">{t('orders.col_price', 'Precio')}</th>
                    <th className="text-end">{t('orders.col_subtotal', 'Subtotal')}</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.items.map(it => (
                    <tr key={it.id}>
                      <td>{it.name}</td>
                      <td className="text-center">{it.quantity}</td>
                      <td className="text-end">${it.price.toLocaleString()}</td>
                      <td className="text-end">${(it.price * it.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="text-end fw-bold">{t('orders.total', 'Total')}</td>
                    <td className="text-end fw-bold">${selected.total.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="me-auto">
            <Button variant="outline-danger" onClick={() => deleteOrder(selected?.id)}>
              <i className="bi bi-trash me-1"></i> {t('orders.delete', 'Eliminar')}
            </Button>
          </div>
          <div>
            <Button variant="outline-secondary" onClick={() => exportCsv(selected)} className="me-2">
              <i className="bi bi-file-earmark-spreadsheet me-1"></i> {t('orders.export_csv', 'Exportar CSV')}
            </Button>
            <Button variant="outline-primary" onClick={() => printOrder(selected)} className="me-2">
              <i className="bi bi-printer me-1"></i> {t('orders.print_pdf', 'Imprimir')}
            </Button>
            <Button variant="primary" onClick={() => setSelected(null)}>
              {t('orders.close', 'Cerrar')}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OrderHistory;
