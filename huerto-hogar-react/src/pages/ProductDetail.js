import React, { useMemo, useState } from 'react';
import { Container, Row, Col, Button, Badge, Card } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { findProductById } from '../data/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FaShoppingCart, FaBolt, FaStar, FaShieldAlt, FaTruck, FaCheck, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleCart } = useCart();
  const { currentUser } = useAuth();

  const product = useMemo(() => findProductById(id), [id]);
  const [qty, setQty] = useState(1);
  const { t } = useTranslation();
  const images = useMemo(() => {
    const thumbs = Array.isArray(product?.thumbnails) && product.thumbnails.length > 0
      ? product.thumbnails
      : [product?.image, product?.image, product?.image].filter(Boolean);
    return { main: product?.image, thumbs };
  }, [product]);
  const [mainImage, setMainImage] = useState(images.main);
  const [activeThumb, setActiveThumb] = useState(0);

  const handleAddToCart = () => {
    if (!currentUser) {
      navigate('/iniciar-sesion');
      return;
    }
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: qty });
    toggleCart();
  };

  const handleBuyNow = () => {
    if (!currentUser) {
      navigate('/iniciar-sesion');
      return;
    }
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: qty });
    navigate('/checkout');
  };

  if (!product) {
    return (
      <Container className="py-5">
        <h2>{t('product_detail.not_found', 'Producto no encontrado')}</h2>
        <Button variant="primary" onClick={() => navigate('/productos')}>{t('product_detail.back_to_products', 'Volver a productos')}</Button>
      </Container>
    );
  }

  // Campos opcionales: solo mostrar si existen en el catálogo
  const description = product.description || '';
  const energy = product.energy || '';
  const rating = product.rating || 4.5;
  const reviews = product.reviews || 0;
  const stock = product.stock ?? 0;
  const benefits = Array.isArray(product.benefits) ? product.benefits : [];
  const uses = Array.isArray(product.uses) ? product.uses : [];
  const recipe = product.recipe && product.recipe.title ? product.recipe : null;
  const discountPct = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const featureItems = product.features && product.features.length 
    ? product.features 
    : ['100% Orgánico', 'Sin pesticidas químicos', 'Cultivado localmente', 'Fresco y natural'];

  return (
    <Container className="py-5">
      <Row className="g-5">
        {/* Columna de imágenes con thumbnails */}
        <Col lg={6} className="pt-4">
          <div className="product-images">
            <div className="main-image mb-3">
              <img 
                src={mainImage || product.image || '/static/img/product-placeholder.jpg'} 
                alt={product.name} 
                className="img-fluid rounded shadow"
                style={{ width: '100%', height: '400px', objectFit: 'cover' }}
              />
            </div>
            <div className="thumbnail-images d-flex gap-2">
              {images.thumbs.map((src, i) => (
                <img 
                  key={i}
                  src={src}
                  alt={`thumb-${i+1}`}
                  className={`img-thumbnail ${activeThumb === i ? 'border-success border-2' : ''}`}
                  style={{ width: 80, height: 80, objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => { setMainImage(src); setActiveThumb(i); }}
                />
              ))}
            </div>
          </div>
        </Col>

        {/* Columna de información */}
        <Col lg={6}>
          <div className="product-info text-start">
            {/* Breadcrumbs */}
            <div className="text-muted small mb-2 d-flex align-items-center">
              <span role="button" onClick={() => navigate('/')} className="text-decoration-none text-muted">{t('product_detail.breadcrumb_home', 'Inicio')}</span>
              <FaChevronRight className="mx-2" />
              <span role="button" onClick={() => navigate('/productos')} className="text-decoration-none text-muted">{t('product_detail.breadcrumb_products', 'Productos')}</span>
              <FaChevronRight className="mx-2" />
              <span className="text-body">{product.name}</span>
            </div>
            <h1 className="display-6 pt-2 mb-3 text-start">{product.name}</h1>
            <div className="product-rating mb-3 d-flex align-items-center">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < Math.round(rating) ? 'text-warning me-1' : 'text-muted me-1'} />
              ))}
              <span className="ms-2 text-muted">({rating?.toFixed(1)}) {reviews} {t('product_detail.reviews', 'reseñas')}</span>
            </div>

            <div className="price-section mb-4 text-start">
              <div className="d-flex align-items-center">
                <span className="display-5 text-primary fw-bold me-3">${product.price?.toLocaleString()}</span>
                {!!discountPct && (
                  <>
                    <span className="text-muted text-decoration-line-through fs-5">${product.originalPrice.toLocaleString()}</span>
                    <span className="badge bg-danger ms-2">-{discountPct}%</span>
                  </>
                )}
              </div>
            </div>

            {description && (
              <div className="product-description mb-4 text-start">
                <h5>{t('product_detail.description', 'Descripción')}</h5>
                <p className="text-muted mb-0">{description}</p>
              </div>
            )}

            {(featureItems && featureItems.length) && (
              <div className="product-features mb-4 text-start">
                <h5>{t('product_detail.features', 'Características')}</h5>
                <ul className="list-unstyled mb-0">
                  {featureItems.map((it, i) => (
                    <li key={`f-${i}`}><FaCheck className="text-success me-2" />{it}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="quantity-section mb-4 text-start">
              <h5>{t('product_detail.quantity', 'Cantidad')}</h5>
              <div className="d-flex align-items-center">
                <Button variant="outline-secondary" onClick={() => setQty(q => Math.max(1, q - 1))}>-</Button>
                <input 
                  type="number" 
                  className="form-control text-center mx-2" 
                  value={qty} 
                  onChange={(e) => setQty(Math.min(Math.max(1, Number(e.target.value) || 1), stock || 99))}
                  min={1} 
                  max={stock || 99}
                  style={{ width: 90 }}
                />
                <Button variant="outline-secondary" onClick={() => setQty(q => Math.min((stock || 99), q + 1))}>+</Button>
              </div>
            </div>

            <div className="action-buttons text-start">
              <Button variant="primary" size="lg" className="me-3" disabled={stock === 0} onClick={handleAddToCart}>
                <FaShoppingCart className="me-2" />{t('product_detail.add_to_cart', 'Agregar al Carrito')}
              </Button>
              <Button variant="outline-primary" size="lg" disabled={stock === 0} onClick={handleBuyNow}>
                <FaBolt className="me-2" />{t('product_detail.buy_now', 'Comprar Ahora')}
              </Button>
            </div>

            <div className="product-meta mt-4">
              <div className="row">
                <div className="col-12 col-sm-6">
                  <small className="text-muted"><FaTruck className="me-1" />{t('product_detail.free_shipping', 'Envío gratis en compras +$15.000')}</small>
                </div>
                <div className="col-12 col-sm-6">
                  <small className="text-muted"><FaShieldAlt className="me-1" />{t('product_detail.fresh_guarantee', 'Garantía de frescura')}</small>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>

    </Container>
  );
};

export default ProductDetail;
