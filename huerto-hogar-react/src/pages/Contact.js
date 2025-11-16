import React, { useCallback, useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { sendEmailVerification } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const [emailJsReady, setEmailJsReady] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Cargar EmailJS por CDN y hacer init con la public key indicada
  useEffect(() => {
    const existing = document.querySelector('script[data-emailjs]');
    if (existing) { setEmailJsReady(true); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/emailjs-com@2/dist/email.min.js';
    s.async = true;
    s.defer = true;
    s.dataset.emailjs = 'true';
    s.onload = () => {
      // llave publica
      // eslint-disable-next-line no-undef
      window.emailjs && window.emailjs.init('Na0bl_HZG-qZE64KK');
      setEmailJsReady(true);
    };
    document.body.appendChild(s);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!currentUser) { navigate('/iniciar-sesion'); return; }
    if (!currentUser.emailVerified) { alert(t('contact.verify_required')); return; }
    if (!window.emailjs || !emailJsReady) { alert(t('contact.emailjs_not_ready')); return; }
    const form = e.currentTarget;
    // Enviar usando sendForm para mantener compatibilidad con el template
    window.emailjs
      .sendForm('service_e5ob07l', 'template_qfmlnlj', form)
      .then(() => {
        alert(t('contact.sent_success'));
        form.reset();
      })
      .catch((err) => {
        console.error('EmailJS error:', err);
        alert(t('contact.sent_error'));
      });
  }, [currentUser, emailJsReady, navigate]);

  return (
    <div className="contact-page">
      {/* Hero igual al About */}
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
          <div className="text-start">
            <h1 className="display-4 fw-bold mb-2">Contactos</h1>
            <div className="text-muted">Facebook / Instagram / Whatsapp</div>
          </div>
        </Container>
      </section>

      {/* Título de sección */}
      <section className="py-5 bg-white">
        <Container>
          <div className="text-center mb-5">
            <div className="d-flex justify-content-center">
              <div className="section-header mb-2"></div>
            </div>
            <h2 className="section-title mb-2">Contactanos</h2>
            <p className="text-muted">Dejenos tu mensaje, te contestaremos pronto!.</p>
          </div>

          <Row className="g-5 justify-content-center">
            {/* Panel izquierdo */}
            <Col lg={5} md={12}>
              <div className="bg-primary text-white d-flex flex-column align-items-start text-start h-100 p-4 ps-3 rounded-3">
                <h5 className="text-white">Llámanos</h5>
                <p className="mb-5"><FaPhoneAlt className="me-2" />+56958007644</p>

                  {/*<h5 className="text-white">Nuestro email</h5>
                   <p className="mb-5"><FaEnvelope className="me-2" />huertohogar.info@gmail.com</p>*/}

                <h5 className="text-white">Nuestra oficina</h5>
                <p className="mb-5"><FaMapMarkerAlt className="me-2" />Av. España Nº8, Santiago chile</p>

                <h5 className="text-white">Nuestras redes</h5>
                <div className="d-flex pt-2">
                  <a className="btn btn-square btn-outline-light rounded-circle me-2" href="https://www.facebook.com/login/?locale=es_LA" target="_blank" rel="noreferrer"><FaFacebookF /></a>
                  <a className="btn btn-square btn-outline-light rounded-circle me-2" href="https://www.instagram.com/accounts/login/" target="_blank" rel="noreferrer"><FaInstagram /></a>
                  <a className="btn btn-square btn-outline-light rounded-circle" href="https://wa.me/+56958007645" target="_blank" rel="noreferrer"><FaWhatsapp /></a>
                </div>
              </div>
            </Col>

            {/* Formulario */}
            <Col lg={7} md={12}>
              <Form id="contact-form" onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Floating>
                      <Form.Control id="Nombre" name="Nombre" type="text" placeholder={t('contact.name_placeholder', 'Nombre')} required disabled={!currentUser || !currentUser.emailVerified} />
                      <label htmlFor="Nombre">{t('contact.name_label', 'Nombre completo')}</label>
                    </Form.Floating>
                  </Col>
                  <Col md={6}>
                    <Form.Floating>
                      <Form.Control id="correo" name="correo" type="email" placeholder={t('labels.email_placeholder')} required disabled={!currentUser || !currentUser.emailVerified} />
                      <label htmlFor="correo">{t('labels.email', 'Correo')}</label>
                    </Form.Floating>
                  </Col>
                  <Col xs={12}>
                    <Form.Floating>
                      <Form.Control id="asunto" name="asunto" type="text" placeholder={t('contact.subject_placeholder', 'Asunto')} disabled={!currentUser || !currentUser.emailVerified} />
                      <label htmlFor="asunto">{t('contact.subject_label', 'Asunto')}</label>
                    </Form.Floating>
                  </Col>
                  <Col xs={12}>
                    <Form.Floating>
                      <Form.Control as="textarea" id="mensaje" name="mensaje" placeholder={t('contact.message_placeholder', 'Mensaje')} style={{ height: 200 }} disabled={!currentUser || !currentUser.emailVerified} />
                      <label htmlFor="mensaje">{t('contact.message_label', 'Mensaje')}</label>
                    </Form.Floating>
                  </Col>
                  <Col xs={12}>
                    <Button type="submit" className="btn btn-primary rounded-pill py-3 px-5" disabled={!currentUser || !currentUser.emailVerified}>
                      {!currentUser ? t('contact.login_to_send') : (!currentUser.emailVerified ? t('contact.verify_to_send') : t('contact.send'))}
                    </Button>
                    {currentUser && !currentUser.emailVerified && (
                      <Button
                        type="button"
                        variant="outline-secondary"
                        className="ms-3"
                        onClick={async () => { try { await sendEmailVerification(currentUser); alert(t('auth.verification_resent')); } catch (e) { alert(t('errors.try_again_later')); } }}
                      >
                        {t('header.resend')}
                      </Button>
                    )}
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Contact;
