import React from 'react';
import { Container, Row, Col, Carousel } from 'react-bootstrap';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'John Smith',
      role: 'Cliente frecuente',
      content: 'Los productos de HuertoHogar son increíblemente frescos y deliciosos. Me encanta la calidad de sus frutas y verduras. ¡Siempre llegan en perfecto estado!',
      rating: 5,
      image: '/static/img/testimonial-1.jpg'
    },
    {
      id: 2,
      name: 'Jhon Doe',
      role: 'Chef profesional',
      content: 'Como chef, soy muy exigente con los ingredientes que uso. Los productos orgánicos de HuertoHogar son de la mejor calidad que he encontrado en el mercado.',
      rating: 5,
      image: '/static/img/testimonial-2.jpg'
    },
    {
      id: 3,
      name: 'jane Doe',
      role: 'Nutricionista',
      content: 'Recomiendo HuertoHogar a todos mis pacientes. Sus productos orgánicos son ideales para mantener una alimentación saludable y equilibrada.',
      rating: 4,
      image: '/static/img/testimonial-4.jpg'
    }
  ];

  // Si no hay imágenes de testimonios, usamos placeholders
  const getImageUrl = (image) => {
    try {
      // Intenta cargar la imagen, si falla usa un placeholder
      new URL(image);
      return image;
    } catch (e) {
        return `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`;
    }
  };

  return (
    <section className="py-5 bg-white">
      <Container>
        <div className="text-center mb-5">
          <h2 className="section-title mb-3 title-lines d-inline-block">Lo que dicen nuestros clientes</h2>
          <p className="lead">Descubre las experiencias de quienes ya confían en nosotros</p>
        </div>

        <Row className="justify-content-center">
          <Col lg={10}>
            <Carousel indicators={false} controls={true} className="testimonial-carousel">
              {testimonials.map((testimonial) => (
                <Carousel.Item key={testimonial.id} className="mb-4">
                  <div className="testimonial-item text-center p-4 p-lg-5 rounded-3 bg-light">
                    <div className="mb-4">
                      <img 
                        src={getImageUrl(testimonial.image)} 
                        alt={testimonial.name}
                        className="img-fluid rounded-circle mb-3"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                      <h5 className="mb-1">{testimonial.name}</h5>
                      <p className="text-muted mb-3">{testimonial.role}</p>
                      <div className="mb-3">
                        {[...Array(5)].map((_, i) => (
                          <i 
                            key={i} 
                            className={`fas fa-star${i < testimonial.rating ? ' text-warning' : ' text-muted'}`}
                          ></i>
                        ))}
                      </div>
                    </div>
                    <p className="lead mb-0">"{testimonial.content}"</p>
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Testimonials;
