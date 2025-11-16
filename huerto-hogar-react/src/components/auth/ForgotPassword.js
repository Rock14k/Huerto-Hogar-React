import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useTranslation } from 'react-i18next';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  //const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      return setError(t('errors.email_required', 'Por favor ingresa tu correo electrónico'));
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(t('auth.reset_email_sent', 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña'));
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setError(t('auth.user_not_found', 'No existe una cuenta con este correo electrónico'));
      } else {
        setError(t('errors.try_again_later'));
      }
    }

    setLoading(false);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2>{t('auth.reset_title', 'Restablecer Contraseña')}</h2>
                <p className="text-muted">{t('auth.reset_subtitle', 'Te enviaremos un correo para restablecer tu contraseña')}</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}
              {message && <Alert variant="success">{message}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4" controlId="formBasicEmail">
                  <Form.Label>{t('labels.email', 'Correo electrónico')}</Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder={t('labels.email_placeholder')} 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </Form.Group>

                <Button 
                  variant="success" 
                  type="submit" 
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? t('auth.sending', 'Enviando...') : t('auth.send_instructions', 'Enviar Instrucciones')}
                </Button>

                <div className="text-center mt-4">
                  <p className="mb-0">
                    <Link to="/iniciar-sesion" className="text-success text-decoration-none fw-semibold">
                      {t('auth.back_to_login', 'Volver al inicio de sesión')}
                    </Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
