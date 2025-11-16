import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Carousel } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

// Componentes
import FeaturedProducts from "../components/home/FeaturedProducts";
import Features from "../components/home/Features";
import Testimonials from "../components/home/Testimonials";
import BlogSection from "../components/home/BlogSection";

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Slider */}
      <section className="hero-slider">
        <Carousel fade controls={false} indicators={false}>
          <Carousel.Item className="position-relative">
            <div
              className="d-flex align-items-center min-vh-100"
              style={{
                backgroundImage: "url(/static/img/carousel-1.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "600px",
              }}
            >
              <div className="bg-dark bg-opacity-50 position-absolute w-100 h-100"></div>
              <Container className="position-relative z-index-1 py-5">
                <Row className="justify-content-start">
                  <Col lg={7} className="text-white">
                    <h1 className="display-4 fw-bold mb-4">
                      Cultiva salud, compra Orgánico
                    </h1>
                    <p className="lead mb-5">
                      Productos frescos directamente desde el campo a tu hogar,
                      cultivados con amor y respeto por la naturaleza.
                    </p>
                    <div className="d-flex flex-wrap gap-3">
                      <Link
                        to="/productos?categoria=lacteos"
                        className="btn btn-primary btn-lg rounded-pill px-4 py-3"
                      >
                        Lácteos
                      </Link>
                      <Link
                        to="/productos?categoria=frutas"
                        className="btn btn-outline-light btn-lg rounded-pill px-4 py-3"
                      >
                        Frutas
                      </Link>
                    </div>
                  </Col>
                </Row>
              </Container>
            </div>
          </Carousel.Item>

          <Carousel.Item className="position-relative">
            <div
              className="d-flex align-items-center min-vh-100"
              style={{
                backgroundImage: "url(/static/img/carousel-2.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "600px",
              }}
            >
              <div className="bg-dark bg-opacity-50 position-absolute w-100 h-100"></div>
              <Container className="position-relative z-index-1 py-5">
                <Row className="justify-content-start">
                  <Col lg={7} className="text-white">
                    <h1 className="display-4 fw-bold mb-4">
                      Sabor natural, salud sin igual
                    </h1>
                    <p className="lead mb-5">
                      Descubre la diferencia de los productos orgánicos,
                      cultivados sin químicos ni pesticidas dañinos.
                    </p>
                    <div className="d-flex flex-wrap gap-3">
                      <Link
                        to="/productos?categoria=frutas"
                        className="btn btn-primary btn-lg rounded-pill px-4 py-3"
                      >
                        Frutas
                      </Link>
                      <Link
                        to="/productos?categoria=verduras"
                        className="btn btn-outline-light btn-lg rounded-pill px-4 py-3"
                      >
                        Verduras
                      </Link>
                    </div>
                  </Col>
                </Row>
              </Container>
            </div>
          </Carousel.Item>
        </Carousel>
      </section>

      {/* About Section */}
      <section className="py-5 my-5">
        <Container>
          <Row className="g-5 align-items-center">
            <Col lg={6} className="wow fadeIn" data-wow-delay="0.1s">
              <div className="position-relative overflow-hidden p-5 pe-0">
                <img
                  src="/static/img/huerta2.jpg"
                  alt="De la tierra a tu mesa"
                  className="img-fluid rounded-3 shadow"
                />
              </div>
            </Col>
            <Col lg={6} className="wow fadeIn" data-wow-delay="0.5s">
              <h2 className="display-5 mb-4">De la tierra a tu mesa</h2>
              <p className="mb-4">
                Somos una tienda online dedicada a llevar la frescura y calidad
                de los productos del campo directamente a la puerta de nuestros
                clientes en Chile. Con más de 6 años de experiencia, operamos en
                más de 9 puntos a lo largo del país, incluyendo ciudades clave
                como Santiago, Puerto Montt, Villarica, Nacimiento, Viña del
                Mar, Valparaíso, y Concepción.
              </p>
              <p>
                Nuestra misión es conectar a las familias chilenas con el campo,
                garantizando la frescura y el sabor en cada entrega. Nos
                comprometemos a fomentar una conexión más cercana entre los
                consumidores y los agricultores locales, apoyando prácticas
                agrícolas sostenibles promoviendo una alimentación saludable en
                todos los hogares chilenos.
              </p>
              <Link to="/nosotros" className="btn btn-primary mt-3">
                Conoce más sobre nosotros{" "}
                <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
              </Link>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <Features />

      {/* Featured Products */}
      <section className="py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Productos Destacados</h2>
            <p className="lead">
              Descubre nuestra selección de productos orgánicos más populares
            </p>
          </div>
          <FeaturedProducts />
          <div className="text-center mt-5">
            <Link to="/productos" className="btn btn-primary btn-lg">
              Ver todos los productos{" "}
              <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Section (moved above Blog) */}
      <section className="py-5 bg-primary text-white mb-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={8} className="mb-4 mb-lg-0">
              <h2 className="mb-3">¿Listo para comenzar a comer más sano?</h2>
              <p className="mb-0">
                Únete a nuestra comunidad y recibe ofertas exclusivas en tu
                correo.
              </p>
            </Col>
            <Col lg={4} className="text-lg-end">
              <Link to="/registro" className="btn btn-secondary btn-lg px-4 rounded-pill">
                Regístrate ahora
              </Link>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Blog Section */}
      <BlogSection />

    </div>
  );
};

export default Home;
