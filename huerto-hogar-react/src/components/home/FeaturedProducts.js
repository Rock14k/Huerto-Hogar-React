import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faEye, faHeart } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const FeaturedProducts = () => {
  // Estado para los productos destacados
  const [featuredProducts, setFeaturedProducts] = useState([
    {
      id: "Manzanas Orgánicas",
      name: 'Manzanas Orgánicas',
      price: 2500,
      originalPrice: 2990,
      image: '/static/img/manzanas-fuji.jpg',
      category: 'Frutas',
      rating: 4.5,
      isNew: true,
      discount: 16
    },
    {
      id: "Leche Orgánica",
      name: 'Leche Orgánica',
      price: 1990,
      originalPrice: 2490,
      image: '/static/img/leche.webp',
      category: 'Lácteos',
      rating: 4.8,
      isNew: false,
      discount: 20
    },
      {
          id: "Chocolate-Milo",
          name: 'chocolate milo',
          price: 1990,
          originalPrice: 2490,
          image: '/static/img/milo.jpeg',
          category: 'Lácteos',
          rating: 4.8,
          isNew: false,
          discount: 20
      },
    {
      id: "Pan Integral",
      name: 'Pan Integral',
      price: 3490,
      originalPrice: 3990,
      image: '/static/img/pan-integral.avif',
      category: 'Panadería',
      rating: 4.2,
      isNew: true,
      discount: 13
    },
    {
      id: "Miel Pura",
      name: 'Miel Pura',
      price: 5990,
      originalPrice: 6990,
      image: '/static/img/miel_organica.png',
      category: 'Endulzantes',
      rating: 4.9,
      isNew: false,
      discount: 14
    },

      {
          id: 'Kit-inicio',
          name: 'Kit de Inicio de Huerto',
          price: 29990,
          originalPrice: 34990,
          image: '/static/img/kit-inicio.webp',
          category: 'kits',
          rating: 4.5, reviews: 24,
          isNew: true,
          discount: 13
      },
      {
          id: 'Macetero',
          name: 'Macetero de Madera 30L',
          price: 12990,
          originalPrice: 15990,
          category: 'maceteros',
          rating: 4.2,
          isNew: true,
          image: '/static/img/macetero-madera.jpg',
          discount: 17

      },
      {
          id: 'Tijeras-podar',
          name: 'Tijeras de Podar Profesionales',
          price: 8990,
          originalPrice: 9990,
          category: 'herramientas',
          rating: 4.8,
          isNew: true,
          image: '/static/img/Tijera-de-poda.webp',
          discount: 11

      },
      {
          id: 'Regadera',
          name: 'Regadera de metal Profesionales',
          price: 8990,
          originalPrice: 9990,
          category: 'herramientas',
          rating: 4.8,
          isNew: true,
          image: '/static/img/Regadera de Metal 5L.avif',
          discount: 11

      },
      {
          id: 'Semilla-tomate',
          name: 'Semillas de Tomate',
          price: 3990,
          originalPrice: 5990,
          category: 'herramientas',
          rating: 4.8,
          isNew: true,
          image: '/static/img/semilla-de-tomate.jpg',
          discount: 13

      },
      {
          id: 'Sustrato-universal',
          name: 'Sustrato Universal',
          price: 6990,
          originalPrice: 8990,
          category: 'herramientas',
          rating: 4.8,
          isNew: true,
          image: '/static/img/Sustrato Universal 50L.webp',
          discount: 11

      },
      {
          id: 'kit-inicio',
          name: 'Kit de Inicio de Huerto',
          price: 5990,
          originalPrice: 9990,
          category: 'herramientas',
          rating: 4.8,
          isNew: true,
          image: '/static/img/kit-inicio.webp',
          discount: 19

      }
  ]);

  // Función para formatear precios
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const { addToCart, toggleCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Función para manejar agregar al carrito
  const handleAddToCart = (product, e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/iniciar-sesion');
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    });
    toggleCart();
  };

  // Función para manejar agregar a favoritos
  const handleAddToWishlist = (productId, e) => {
    e.preventDefault();
    // Lógica para agregar a favoritos
    console.log(`Producto ${productId} agregado a favoritos`);
  };

  return (
    <div className="row g-4">
      {featuredProducts.map((product) => (
        <div key={product.id} className="col-lg-3 col-md-6">
          <Card className="product-card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
            <div className="position-relative">
              <Card.Img 
                variant="top" 
                src={product.image} 
                alt={product.name}
                className="img-fluid"
                style={{ height: '220px', objectFit: 'cover' }}
              />
              
              {/* Badges */}
              <div className="position-absolute top-0 start-0 p-2">
                {product.isNew && (
                  <span className="badge bg-primary">Nuevo</span>
                )}
                {product.discount > 0 && (
                  <span className="badge bg-danger ms-1">-{product.discount}%</span>
                )}
              </div>
              
              {/* Acciones rápidas */}
              <div className="product-actions position-absolute top-0 end-0 p-2 d-flex flex-column">
                <button 
                  className="btn btn-light btn-sm rounded-circle mb-2"
                  onClick={(e) => handleAddToWishlist(product.id, e)}
                  title="Agregar a favoritos"
                >
                  <FontAwesomeIcon icon={faHeart} />
                </button>
                <button 
                  className="btn btn-light btn-sm rounded-circle"
                  title="Vista rápida"
                >
                  <FontAwesomeIcon icon={faEye} />
                </button>
              </div>
            </div>
            
            <Card.Body className="p-3">
              <div className="mb-2">
                <span className="text-muted small">{product.category}</span>
                <div className="d-flex align-items-center mb-1">
                  {[...Array(5)].map((_, i) => (
                    <i 
                      key={i} 
                      className={`fas fa-star${i < Math.floor(product.rating) ? ' text-warning' : ' text-muted'}`}
                    ></i>
                  ))}
                  <small className="ms-1">({product.rating})</small>
                </div>
              </div>
              
              <h5 className="mb-2">
                <Link to={`/productos/${product.id}`} className="text-dark text-decoration-none">
                  {product.name}
                </Link>
              </h5>
              
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  <span className="h5 mb-0 text-primary">{formatPrice(product.price)}</span>
                  {product.originalPrice > product.price && (
                    <del className="small text-muted ms-2">{formatPrice(product.originalPrice)}</del>
                  )}
                </div>
                <button 
                  className="btn btn-sm btn-outline-primary rounded-pill"
                  onClick={(e) => handleAddToCart(product, e)}
                >
                  <FontAwesomeIcon icon={faShoppingCart} className="me-1" />
                  Añadir
                </button>
              </div>
            </Card.Body>
            
            <Card.Footer className="bg-transparent border-top-0 pt-0">
              <div className="d-grid">
                <Link 
                  to={`/productos/${product.id}`} 
                  className="btn btn-outline-secondary btn-sm"
                >
                  Ver detalles
                </Link>
              </div>
            </Card.Footer>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default FeaturedProducts;
