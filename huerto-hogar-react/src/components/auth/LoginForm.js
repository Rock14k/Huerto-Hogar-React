import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase/config';
import { sendEmailVerification } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithGoogle, error, setError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      const user = auth.currentUser;
      if (user && !user.emailVerified) {
        setUnverified(true);
        setError(t('auth.unverified_after_login'));
        try { await sendEmailVerification(user); } catch (e) {/* noop */}
        return;
      }
      navigate('/');
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setError(t('auth.errors.wrong_password', 'Contraseña incorrecta'));
      } else if (error.code === 'auth/user-not-found') {
        setError(t('auth.errors.user_not_found', 'No existe una cuenta con este correo'));
      } else if (error.code === 'auth/too-many-requests') {
        setError(t('auth.errors.too_many_requests', 'Demasiados intentos. Intenta más tarde.'));
      } else if (error.code === 'auth/invalid-email') {
        setError(t('auth.errors.invalid_email', 'El correo electrónico no es válido'));
      } else if (error.code === 'auth/network-request-failed') {
        setError(t('auth.errors.network_error', 'Problema de conexión. Intenta nuevamente.'));
      } else {
        setError(t('auth.login_error'));
      }
    }
    
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (error) {
      setError('Error al iniciar sesión con Google.');
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4 auth-login">
              <div className="text-center mb-4">
                <h2>{t('auth.login_title')}</h2>
                <p className="text-muted">{t('auth.login_subtitle')}</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}
              {unverified && (
                <div className="mb-3 d-flex align-items-center justify-content-between">
                  <small className="text-muted">{t('auth.resend_prompt')}</small>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={async () => {
                      try {
                        if (auth.currentUser) { await sendEmailVerification(auth.currentUser); alert(t('auth.verification_resent')); }
                      } catch (e) {
                        alert(t('errors.try_again_later'));
                      }
                    }}
                  >
                    {t('header.resend')}
                  </Button>
                </div>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Floating className="mb-3">
                  <Form.Control
                    id="loginEmail"
                    type="email"
                    placeholder={t('labels.email_placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <label htmlFor="loginEmail">Correo electrónico</label>
                </Form.Floating>

                <div className="mb-4 position-relative">
                  <Form.Floating className="mb-3 position-relative">
                  <Form.Control
                    id="loginPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('labels.password_placeholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <label htmlFor="loginPassword">{t('labels.password')}</label>
                  </Form.Floating>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    className="toggle-pass"
                    onClick={() => setShowPassword(s => !s)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </div>

                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                  {loading ? t('auth.logging_in') : t('buttons.sign_in')}
                </Button>

                <div className="position-relative text-center my-4">
                  <div className="border-bottom"></div>
                  <span className="bg-white px-2 text-muted" style={{position: 'relative', top: '-12px'}}>O</span>
                </div>

                <Button variant="outline-danger" onClick={handleGoogleSignIn} className="w-100 mt-2">
                  <FaGoogle className="me-2" /> Google
                </Button>

                <div className="text-center mt-4">
                  <p className="mt-3 text-center">
                  {t('auth.no_account')} <Link to="/registro">{t('buttons.sign_up')}</Link>
                </p>
                  <Link to="/olvide-contrasena" className="text-muted text-decoration-none small">
                    {t('auth.forgot_password')}
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginForm;
