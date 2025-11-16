import React from 'react';
import { Container, Row, Col, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Features from '../components/home/Features';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero superior */}
      <section 
        className="about-hero-banner py-5"
        style={{ 
          backgroundImage: "url(/static/img/pattern-food.png), url(/static/img/carousel-1.jpg)",
          backgroundRepeat: 'repeat, no-repeat',
          backgroundPosition: 'center, center',
          backgroundSize: '240px, cover'
        }}
      >
        <Container>
          <div className="text-start hero-left">
            <h1 className="section-title mb-2">Sobre nosotros</h1>
            <div className="text-muted">Misión / Visión / Valores</div>
          </div>
        </Container>
      </section>

      {/* Bloque principal: Mejores Productos Orgánicos */}
      <section className="py-5">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <div className="position-relative">
                <Image 
                  src="/static/img/farmer.jpg" 
                  alt="Mejores Productos Orgánicos"
                  className="img-fluid rounded-3 shadow"
                  style={{ maxHeight: 420, objectFit: 'cover', width: '100%' }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=900&q=60';
                  }}
                />
              </div>
            </Col>
            <Col lg={6}>
              <h2 className="section-title mb-3">Mejores Productos Orgánicos</h2>
              <p className="about-justified">
                Somos una tienda online dedicada a llevar la frescura y calidad de los productos del campo directamente
                a la puerta de nuestros clientes en Chile. Con más de 6 años de experiencia, operamos en más de 9 puntos
                a lo largo del país, incluyendo ciudades clave como Santiago, Puerto Montt, Villarrica, Nacimiento, Viña del
                Mar, Valparaíso y Concepción. Nuestra misión es conectar a las familias chilenas con el campo, promoviendo
                un estilo de vida saludable y sostenible.
              </p>
            </Col>
          </Row>
        </Container>
      </section>
        {/* CTA verde como en estática */}
        <section className="py-5 bg-primary text-white mb-5">
            <Container>
                <Row className="align-items-center">
                    <Col lg={8} className="mb-4 mb-lg-0">
                        <h2 className="mb-3">Visite nuestro campo</h2>
                        <p className="mb-0">
                            Te invitamos a conocernos en persona y descubrir todo lo que tenemos para ofrecer. Nuestro equipo estará encantado de
                            recibirte, responder tus preguntas y brindarte la mejor atención. ¡Ven y vive la experiencia por ti mismo!
                        </p>
                    </Col>
                    <Col lg={4} className="text-lg-end">
                        <Link to="/contacto" className="btn btn-warning btn-lg px-4 rounded-pill">
                            Nuestra huerta
                        </Link>
                    </Col>
                </Row>
            </Container>
        </section>
      {/* Características (usa el componente con su propio header) */}
      <Features />
    </div>
  );
};

export default About;
