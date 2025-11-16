import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Features = () => {
  const features = [
    {
      icon: '/static/img/icon-1.png',
      title: 'Procesos Naturales',
      description: 'Cultivamos con técnicas tradicionales y respetuosas con el medio ambiente, asegurando la calidad y frescura de nuestros productos.'
    },
    {
      icon: '/static/img/icon-2.png',
      title: 'Productos Orgánicos',
      description: 'En HuertoHogar tomamos muy en serio el compromiso del uso de productos orgánicos, para ofrecerte productos saludables y sostenibles que cuiden tu salud y el medio ambiente.'
    },
    {
      icon: '/static/img/icon-3.png',
      title: 'Biológicamente Seguro',
      description: 'Nuestros productos están hechos con ingredientes orgánicos de alta calidad, cultivados sin el uso de pesticidas ni fertilizantes químicos que puedan dañar nuestra salud y la de nuestros clientes.'
    }
  ];

  return (
    <section className="py-5 bg-light">
      <Container>
        <div className="text-center mb-5">
          <h2 className="section-title mb-3 title-lines d-inline-block">Nuestras Características</h2>
          <p className="lead">
            En HuertoHogar, nos enorgullecemos de llevar la frescura y calidad del campo directamente a la puerta de 
            nuestros clientes en Chile, actualmente somos líderes en la distribución de productos frescos y naturales 
            en Chile, reconocidos por nuestra calidad excepcional, servicio al cliente y compromiso con la sostenibilidad.
          </p>
        </div>
        
        <Row className="g-4">
          {features.map((feature, index) => (
            <Col lg={4} md={6} key={index} className="wow fadeInUp" data-wow-delay={`${0.1 * (index + 1)}s`}>
              <div className="bg-white text-center h-100 p-4 p-xl-5 rounded-3 shadow-sm">
                <div className="feature-icon mb-4">
                  <img 
                    src={feature.icon} 
                    alt={feature.title} 
                    className="img-fluid"
                    style={{ height: '80px' }}
                  />
                </div>
                <h4 className="mb-3">{feature.title}</h4>
                <p className="mb-0">{feature.description}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Features;
