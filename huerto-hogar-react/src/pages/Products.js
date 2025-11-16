import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge } from 'react-bootstrap';
import { FaStar, FaRegStar, FaShoppingCart, FaHeart, FaEye } from 'react-icons/fa';
import './Products.css';
import { products as catalog } from '../data/products';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

// Usamos el catálogo central
const productsData = catalog;

// Las etiquetas se traducen con t() al renderizar
const pills = [
  { id: 'vegetales', nameKey: 'products.pill_vegetales' },
  { id: 'frutas', nameKey: 'products.pill_frutas' },
  { id: 'lacteos', nameKey: 'products.pill_lacteos' },
];

const Products = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const { addToCart, toggleCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts(productsData);
      setFilteredProducts(productsData);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let result = [...products];
    if (selectedCategory) {
      result = result.filter(p => (p.category || '').toLowerCase() === selectedCategory);
    }
    setFilteredProducts(result);
  }, [products, selectedCategory]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) stars.push(<FaStar key={i} className="text-warning" />);
      else if (i === fullStars + 1 && hasHalfStar) stars.push(<FaStar key={i} className="text-warning" style={{ opacity: 0.5 }} />);
      else stars.push(<FaRegStar key={i} className="text-warning" />);
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" role="status" variant="success">
          <span className="visually-hidden">{t('common.loading')}</span>
        </Spinner>
      </div>
    );
  }

  const isFav = (id) => favorites.includes(id);
  const toggleFavorite = (id) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  return (
    <div className="products-page py-5">
      <Container>
        {/* Encabezado con línea doble + título y subtítulo */}
        <div className="mb-3">
          <div className="section-header mb-2"></div>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
            <div className="text-start">
              <h1 className="display-6 fw-bold mb-1">{t('products.title')}</h1>
              <small className="text-muted subtitle">{t('products.subtitle')}</small>
            </div>
            <div className="filter-pills mt-3 mt-md-0">
              {pills.map(p => (
                <Button
                  key={p.id}
                  size="sm"
                  variant={selectedCategory === p.id ? 'primary' : 'outline-primary'}
                  className="me-2 mb-2"
                  onClick={() => setSelectedCategory(selectedCategory === p.id ? '' : p.id)}
                >
                  {t(p.nameKey)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <Row xs={1} sm={2} lg={3} className="g-4">
            {filteredProducts.map((product) => (
              <Col key={product.id}>
                <Card className="h-100 product-card">
                  <div className="position-relative">
                    <Link to={`/productos/${product.id}`}>
                      <Card.Img variant="top" src={product.image} alt={product.name} className="product-image" />
                    </Link>
                    <Badge className="badge-fresh position-absolute top-0 start-0 m-2">Frescos</Badge>
                    {/* t('products.fresh') visible en cinta si se desea */}
                  </div>
                  <Card.Body>
                    <Card.Title className="mb-2">
                      <Link to={`/producto/${product.id}`} className="text-decoration-none text-dark">
                        {product.name}
                      </Link>
                    </Card.Title>
                    <div className="d-flex align-items-center mb-2">
                      {renderStars(product.rating)}
                      <small className="text-muted ms-2">({product.reviews || 0})</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="h5 text-success me-2">${product.price.toLocaleString()}</span>
                      {product.originalPrice > product.price && (
                        <del className="text-muted small">${product.originalPrice.toLocaleString()}</del>
                      )}
                    </div>
                    <div className="mt-3 d-flex">
                      <Button 
                        variant="outline-secondary" 
                        className="me-2"
                        onClick={() => navigate(`/productos/${product.id}`)}
                      >
                        <FaEye className="me-2" /> {t('products.view_detail')}
                      </Button>
                      <Button 
                        variant={isFav(product.id) ? 'primary' : 'outline-primary'} 
                        className="me-2"
                        onClick={() => toggleFavorite(product.id)}
                      >
                        <FaHeart className="me-2" /> {isFav(product.id) ? t('products.unlike') : t('products.like')}
                      </Button>
                      <Button 
                        variant="success"
                        onClick={() => {
                          if (!currentUser) { navigate('/iniciar-sesion'); return; }
                          addToCart({ id: product.id, name: product.name, price: product.price, image: product.image });
                          toggleCart();
                        }}
                      >
                        <FaShoppingCart className="me-2" /> {t('products.add_to_cart')}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center py-5 text-muted">{t('products.no_results')}</div>
        )}
      </Container>
    </div>
  );
};

export default Products;
