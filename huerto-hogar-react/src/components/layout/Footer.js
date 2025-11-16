import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faClock,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebookF,
  faInstagram,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showTop, setShowTop] = useState(false);
  const { t } = useTranslation();

  // Cargar Leaflet por CDN y dibujar mapa en el footer
  useEffect(() => {
    const ensureLeaflet = async () => {
      // Evitar cargas duplicadas
      const existingCss = document.querySelector('link[data-leaflet]');
      const existingJs = document.querySelector('script[data-leaflet]');
      if (!existingCss) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.setAttribute('data-leaflet', 'true');
        document.head.appendChild(link);
      }
      if (!existingJs) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.async = true;
          script.defer = true;
          script.setAttribute('data-leaflet', 'true');
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }
    };

    const initMap = () => {
      // @ts-ignore
      if (!window.L) return;
      const L = window.L;
      const container = document.getElementById('footerMap');
      if (!container || container.dataset.initialized) return;
      container.dataset.initialized = 'true';

      const map = L.map('footerMap', {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([-35.6751, -71.543], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const cities = [
        { name: 'Viña del Mar', lat: -33.0153, lng: -71.5500 },
        { name: 'Valparaíso', lat: -33.0472, lng: -71.6127 },
        { name: 'Santiago', lat: -33.4489, lng: -70.6693 },
        { name: 'Concepción', lat: -36.8201, lng: -73.0444 },
        { name: 'Nacimiento', lat: -37.5023, lng: -72.6736 },
        { name: 'Villarrica', lat: -39.2850, lng: -72.2270 },
        { name: 'Puerto Montt', lat: -41.4689, lng: -72.9411 },
      ];

      cities.forEach((c) => L.marker([c.lat, c.lng]).addTo(map).bindPopup(c.name));
    };

    (async () => {
      await ensureLeaflet();
      initMap();
    })();
  }, []);

  // Mostrar/ocultar botón flotante según scroll
  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer bg-dark text-white pt-5 pb-3">
      <Container>
        <Row className="g-4 align-items-start">
          {/* Logo y descripción */}
          <Col lg={4} md={6}>
            <h1 className="fw-bold text-primary mb-3">
              Huerto<span className="text-secondary">Hogar</span>
            </h1>
            <p className="mb-4 footer-desc">
              {t('footer.description')}
            </p>
            <div className="d-flex">
              <a
                className="btn btn-outline-light btn-social me-2"
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a
                className="btn btn-outline-light btn-social me-2"
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a
                className="btn btn-outline-light btn-social"
                href="https://wa.me/56958007645"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faWhatsapp} />
              </a>
            </div>
          </Col>

          {/* Información de contacto (Ubicación) */}
          <Col lg={4} md={6}>
            <h5 className="text-white mb-4 footer-col-title">{t('footer.contact_title')}</h5>
            <div className="footer-contact">
            <div className="footer-item d-flex align-items-start mb-2">
              <span className="fi"><FontAwesomeIcon icon={faMapMarkerAlt} /></span>
              <span>Av. España Nº8, Santiago, Chile</span>
            </div>
            <div className="footer-item d-flex align-items-start mb-2">
              <span className="fi"><FontAwesomeIcon icon={faPhone} /></span>
              <span>+56 9 5800 7645</span>
            </div>
            <div className="footer-item d-flex align-items-start mb-2">
              <span className="fi"><FontAwesomeIcon icon={faEnvelope} /></span>
              <span>huertohogar.info@gmail.com</span>
            </div>
            <div className="footer-item d-flex align-items-start">
              <span className="fi"><FontAwesomeIcon icon={faClock} /></span>
              <span>Lunes - Viernes: 9:00 - 19:00</span>
            </div>
            </div>
          </Col>

          {/* Enlaces rápidos */}
          <Col lg={4} md={6}>
            <h5 className="text-white mb-4 footer-col-title">{t('footer.quick_links_title')}</h5>
            <div className="d-flex flex-column footer-links">
              <div className="footer-link d-flex align-items-start mb-2">
                <span className="fi"><i className="fa fa-angle-right"></i></span>
                <Link to="/nosotros" className="text-white-50 text-decoration-none">{t('nav.about')}</Link>
              </div>
              <div className="footer-link d-flex align-items-start mb-2">
                <span className="fi"><i className="fa fa-angle-right"></i></span>
                <Link to="/contacto" className="text-white-50 text-decoration-none">{t('nav.contact')}</Link>
              </div>
              <div className="footer-link d-flex align-items-start mb-2">
                <span className="fi"><i className="fa fa-angle-right"></i></span>
                <Link to="/blog" className="text-white-50 text-decoration-none">{t('nav.blog')}</Link>
              </div>
              <div className="footer-link d-flex align-items-start mb-2">
                <span className="fi"><i className="fa fa-angle-right"></i></span>
                <Link to="/productos" className="text-white-50 text-decoration-none">{t('nav.products')}</Link>
              </div>
              <div className="footer-link d-flex align-items-start">
                <span className="fi"><i className="fa fa-angle-right"></i></span>
                <Link to="/iniciar-sesion" className="text-white-50 text-decoration-none">{t('nav.login')}</Link>
              </div>
            </div>
          </Col>
        </Row>

        {/* Mapa de ubicaciones (Leaflet) */}
        <div id="footerMap" className="leaflet-footer-map mt-4 mb-3"></div>

        <hr className="mt-4 mb-3" />

        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <p className="mb-0">
              &copy; {currentYear} HuertoHogar. {t('footer.rights')}
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <p className="mb-0">
              {t('footer.built_by')} <i className="fa fa-heart text-danger"></i> HuertoHogar
            </p>
          </div>
        </div>
      </Container>

      {showTop && (
        <button className="scroll-top-btn" onClick={scrollToTop} aria-label={t('footer.scroll_top_label')}>
          <FontAwesomeIcon icon={faArrowUp} />
        </button>
      )}
    </footer>
  );
};

export default Footer;
