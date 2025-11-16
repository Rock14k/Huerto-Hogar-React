
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faEnvelope, faSearch, faUser, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { Container, Navbar, Nav, Form, Button, Badge } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase/config';
import { sendEmailVerification } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount, toggleCart } = useCart();
  const { currentUser } = useAuth();
  const { t, i18n } = useTranslation();

  const handleSearch = (e) => {
    e.preventDefault();
    const query = (searchQuery || '').trim();
    if (query) {
      navigate(`/productos?search=${encodeURIComponent(query)}`);
    }
  };

  // Efecto para inicializar tooltips de Bootstrap
  useEffect(() => {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map((tooltipTriggerEl) => {
      return new window.bootstrap.Tooltip(tooltipTriggerEl);
    });
  }, []);

  return (
    <>
      {/* Top Bar */}
      <div className="top-bar d-none d-lg-flex bg-light">
        <Container>
          <div className="row gx-0 align-items-center">
            <div className="col-lg-6 px-5 text-start">
              <small className="me-3">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                Av. España Nº8, Santiago Chile
              </small>
              <small>
                <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                Huertohogar.info@gmail.com
              </small>
            </div>

      {/* Verification banner */}
      {currentUser && !currentUser.emailVerified && (
        <div className="bg-warning">
          <Container>
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between py-2">
              <div className="small text-dark mb-2 mb-md-0">{String(t('header.unverified'))}</div>
              <div>
                <Button
                  size="sm"
                  variant="outline-dark"
                  onClick={async () => {
                    try {
                      if (auth.currentUser) { await sendEmailVerification(auth.currentUser); alert('Verificación reenviada. Revisa tu correo.'); }
                    } catch (e) {
                      alert('No se pudo reenviar. Intenta más tarde.');
                    }
                  }}
                >
                  {String(t('header.resend'))}
                </Button>
              </div>
            </div>
          </Container>
        </div>
      )}
            <div className="col-lg-6 px-5 text-end">
              <small className="me-2">{String(t('header.follow_us'))}</small>
              <a className="text-body me-3" href="https://www.facebook.com/login/?locale=es_LA" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a className="text-body me-3" href="https://www.instagram.com/accounts/login/" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a className="text-body" href="https://wa.me/56958007645" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faWhatsapp} />
              </a>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Navigation */}
      <Navbar expand="lg" className="bg-white py-3 sticky-top shadow-sm">
        <Container>
          <Link to="/" className="navbar-brand">
            <h1 className="fw-bold text-primary m-0">Huerto<span className="text-secondary">Hogar</span></h1>
          </Link>
          
          <Navbar.Toggle aria-controls="navbarCollapse" />
          
          <Navbar.Collapse id="navbarCollapse">
            <Nav className="ms-auto me-4">
              <Link to="/" className="nav-link mx-2">{String(t('nav.home'))}</Link>
              <Link to="/nosotros" className="nav-link mx-2">{String(t('nav.about'))}</Link>
              <Link to="/productos" className="nav-link mx-2">{String(t('nav.products'))}</Link>
              <Link to="/blog" className="nav-link mx-2">{String(t('nav.blog'))}</Link>
              <Link to="/contacto" className="nav-link mx-2">{String(t('nav.contact'))}</Link>
            </Nav>
            
            <div className="d-flex align-items-center">
              {/* Search Bar */}
              <div className="search-container position-relative me-3">
                <Form className="d-flex" onSubmit={handleSearch}>
                  <Form.Control
                    type="search"
                    name="search"
                    placeholder={t('search.placeholder')}
                    className="me-2"
                    aria-label="Buscar"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '200px' }}
                  />
                  <Button variant="outline-primary" type="submit">
                    <FontAwesomeIcon icon={faSearch} />
                  </Button>
                </Form>
              </div>

              {/* User Account */}
              {currentUser ? (
                <Link to="/perfil" className="me-2 p-0 border-0 bg-transparent nav-link d-inline-block" title={String(t('nav.profile'))}>
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="avatar"
                      className="rounded-circle border"
                      style={{ width: 32, height: 32, objectFit: 'cover' }}
                    />
                  ) : (
                    <span className="btn btn-outline-secondary btn-sm rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                      <FontAwesomeIcon icon={faUser} />
                    </span>
                  )}
                </Link>
              ) : (
                <Link to="/iniciar-sesion" className="btn btn-outline-secondary btn-sm rounded-circle me-2" title={String(t('nav.login'))}>
                  <FontAwesomeIcon icon={faUser} />
                </Link>
              )}

              {/* Shopping Cart */}
              <button
                type="button"
                onClick={() => {
                  if (!currentUser) { navigate('/iniciar-sesion'); return; }
                  toggleCart();
                }}
                className="btn btn-outline-secondary btn-sm rounded-circle position-relative me-2"
                aria-label="Cart"
              >
                <FontAwesomeIcon icon={faShoppingBag} />
                {cartCount > 0 && (
                  <Badge 
                    bg="danger" 
                    className="position-absolute top-0 start-100 translate-middle rounded-pill"
                    style={{ fontSize: '0.6rem' }}
                  >
                    {cartCount}
                  </Badge>
                )}
              </button>
            </div>
            {/* Language selector */}
            <div className="ms-2">
              <Form.Select size="sm" value={i18n.language} onChange={(e) => { i18n.changeLanguage(e.target.value); localStorage.setItem('lang', e.target.value); }}>
                <option value="es">ES</option>
                <option value="en">EN</option>
                <option value="fr">FR</option>
              </Form.Select>
            </div>

          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;
