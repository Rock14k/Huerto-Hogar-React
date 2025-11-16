import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faUser, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const BlogSection = () => {
  const blogPosts = [
    {
      id: 1,
      title: 'Beneficios de una alimentación orgánica',
      excerpt: 'Descubre por qué los alimentos orgánicos son la mejor opción para tu salud y el medio ambiente.',
      date: '15 Oct 2023',
      author: 'Equipo HuertoHogar',
      image: '/static/img/blog-1.jpg',
      category: 'Salud'
    },
    {
      id: 2,
      title: 'Cómo cultivar tus propias hierbas en casa',
      excerpt: 'Aprende los secretos para tener un pequeño huerto de hierbas aromáticas en tu cocina o balcón.',
      date: '5 Oct 2023',
      author: 'María Fernández',
      image: '/static/img/blog-2.jpg',
      category: 'Huerto en casa'
    },
    {
      id: 3,
      title: 'Recetas de temporada con productos orgánicos',
      excerpt: 'Deliciosas recetas para aprovechar al máximo los productos de temporada de manera saludable.',
      date: '28 Sep 2023',
      author: 'Chef Carlos Rojas',
      image: '/static/img/blog-3.jpg',
      category: 'Recetas'
    }
  ];

  // Función para acortar el texto
  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <section className="py-5">
      <Container>
        <div className="mb-5">
          <div className="d-flex">
            <div className="ms-auto text-end">
              <h2 className="section-title mb-2 title-lines d-inline-block">Últimas publicaciones del Blog</h2>
              <p className="lead mb-0">Mantente informado con nuestros artículos sobre vida saludable y sostenible</p>
            </div>
          </div>
        </div>

        <Row className="g-4">
          {blogPosts.map((post) => (
            <Col key={post.id} lg={4} md={6}>
              <Card className="h-100 border-0 shadow-sm overflow-hidden">
                <div className="position-relative">
                  <Card.Img 
                    variant="top" 
                    src={post.image} 
                    alt={post.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <div className="position-absolute top-0 start-0 m-3">
                    <span className="badge bg-primary">{post.category}</span>
                  </div>
                </div>
                
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="d-flex align-items-center me-4">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-muted me-2" />
                      <small className="text-muted">{post.date}</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faUser} className="text-muted me-2" />
                      <small className="text-muted">{post.author}</small>
                    </div>
                  </div>
                  
                  <h5 className="mb-3">
                    <Link to={`/blog/${post.id}`} className="text-dark text-decoration-none">
                      {post.title}
                    </Link>
                  </h5>
                  
                  <p className="text-muted mb-4">
                    {truncateText(post.excerpt, 120)}
                  </p>
                  
                  <div className="d-flex align-items-center">
                    <Link 
                      to={`/blog/${post.id}`} 
                      className="text-primary text-decoration-none fw-medium"
                    >
                      Leer más
                      <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="text-center mt-5">
          <Link to="/blog" className="btn btn-outline-primary btn-lg">
            Ver todas las publicaciones
          </Link>
        </div>
      </Container>
    </section>
  );
};

export default BlogSection;
