import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaUser, FaCalendarAlt } from 'react-icons/fa';

const posts = [
  {
    id: 1,
    title: 'Alimentos orgánicos: Un mercado en expansión\nEn los últimos años.',
    author: 'Revista Nutrición 21 Nº 27',
    date: '25 Ene, 2025',
    image: '/static/img/blog-1.jpg',
    url: 'https://uchile.cl/noticias/69199/alimentos-organicos-un-mercado-en-expansion'
  },
  {
    id: 2,
    title: 'Día del Reciclaje\nCompostaje: una práctica sustentable...',
    author: 'Francisca de la Vega Planet – Periodista Campus',
    date: '01 Septiembre, 2025',
    image: '/static/img/blog-2.jpg',
    url: 'https://agronomia.uchile.cl/noticias/163465/compostaje-una-practica-sustentable-para-reducir-basura'
  },
  {
    id: 3,
    title: 'La necesidad de políticas enfocadas en el reciclaje de residuos orgánicos.',
    author: 'Universidad de Chile',
    date: '01 Jan, 2025',
    image: '/static/img/blog-3.jpg',
    url: 'https://www.unep.org/news-and-stories/story/organic-waste-how-your-leftovers-can-light-your-home'
  }
];

const posts2 = [...posts];

const Blog = () => {
  return (
    <div className="blog-page">
      {/* Hero superior igual al About */}
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
            <h1 className="display-4 fw-bold mb-2">Blog</h1>
            <div className="text-muted">Últimas noticias del blog</div>
          </div>
        </Container>
      </section>

      {/* Grid de posts */}
      <section className="py-5 bg-white">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title mb-3 title-lines d-inline-block">Últimas noticias del Blog</h2>
            <p className="lead">La sabiduría es poder, por eso te mantenemos informado de todo lo relacionado con el mercado.</p>
          </div>
          <Row className="g-4">
            {posts.map(post => (
              <Col lg={4} md={6} key={post.id}>
                <Card className="h-100 shadow-sm">
                  <Card.Img 
                    variant="top" 
                    src={post.image} 
                    alt={post.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=60';
                    }}
                  />
                  <Card.Body>
                    <Card.Title className="h5">
                      <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none text-dark d-block">
                        {post.title}
                      </a>
                    </Card.Title>
                  </Card.Body>
                  <Card.Footer className="bg-white">
                    <div className="d-flex justify-content-between text-muted small">
                      <span><FaUser className="me-2 text-success" />{post.author}</span>
                      <span><FaCalendarAlt className="me-2 text-success" />{post.date}</span>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="g-4 mt-1">
            {posts2.map(post => (
              <Col lg={4} md={6} key={`row2-${post.id}`}>
                <Card className="h-100 shadow-sm">
                  <Card.Img 
                    variant="top" 
                    src={post.image} 
                    alt={post.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60';
                    }}
                  />
                  <Card.Body>
                    <Card.Title className="h5">
                      <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none text-dark d-block">
                        {post.title}
                      </a>
                    </Card.Title>
                  </Card.Body>
                  <Card.Footer className="bg-white">
                    <div className="d-flex justify-content-between text-muted small">
                      <span><FaUser className="me-2 text-success" />{post.author}</span>
                      <span><FaCalendarAlt className="me-2 text-success" />{post.date}</span>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="text-center mt-4">
            <Button
              variant="success"
              size="lg"
              className="px-5 rounded-pill"
              as="a"
              href="https://www.healthychildren.org/Spanish/healthy-living/nutrition/Paginas/Organic-Foods-Worth-the-Price.aspx?gad_source=1&gad_campaignid=8703909966&gbraid=0AAAAADyMpZHY1hEFLNpx6M-1KcfppMG2z&gclid=Cj0KCQjwoP_FBhDFARIsANPG24NJ3_8PUehEyachEkv0ewjfwFCXUOs3s9yV-mQVpqf1Hyb35pth7FwaAruHEALw_wcB"
              target="_blank"
              rel="noopener noreferrer"
            >
              Leer más
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Blog;
