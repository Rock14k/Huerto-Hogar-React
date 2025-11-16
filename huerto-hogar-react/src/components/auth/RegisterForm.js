import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { updateProfile, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useTranslation } from 'react-i18next';

const RegisterForm = () => {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [rut, setRut] = useState('');
    const [street, setStreet] = useState('');
    const [region, setRegion] = useState('');
    const [comuna, setComuna] = useState('');
    const [country, setCountry] = useState('Chile');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const geoData = {
        Chile: {
            regiones: {
                'Región Metropolitana': ['Santiago', 'Puente Alto', 'Maipú', 'Ñuñoa', 'Providencia'],
                'Valparaíso': ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana'],
                'Biobío': ['Concepción', 'Talcahuano', 'Los Ángeles'],
                'Los Lagos': ['Puerto Montt', 'Osorno', 'Castro'],
                'Araucanía': ['Temuco', 'Padre Las Casas', 'Villarrica'],
            }
        }
    };

    const countries = Object.keys(geoData);
    const regions = country && geoData[country] ? Object.keys(geoData[country].regiones) : [];
    const comunas = (country && region && geoData[country]?.regiones[region]) ? geoData[country].regiones[region] : [];

    const handleCountryChange = (e) => {
        const val = e.target.value;
        setCountry(val);
        setRegion('');
        setComuna('');
    };

    const handleRegionChange = (e) => {
        const val = e.target.value;
        setRegion(val);
        setComuna('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        setValidated(true);
        if (!form.checkValidity()) {
            e.stopPropagation();
            return;
        }

        if (password !== confirmPassword) {
            return setError('Las contraseñas no coinciden');
        }

        if (password.length < 6) {
            return setError('La contraseña debe tener al menos 6 caracteres');
        }

        setError('');
        setLoading(true);

        try {
            const trimmedEmail = (email || '').trim();
            const trimmedFirst = (firstName || '').trim();
            const trimmedLast = (lastName || '').trim();
            const trimmedStreet = (street || '').trim();
            const cred = await signup(trimmedEmail, password);

            try {
                await updateProfile(cred.user, { displayName: `${trimmedFirst} ${trimmedLast}`.trim() });
            } catch (e) {
                console.warn('updateProfile falló, continuará el flujo:', e);
            }

            try {
                await sendEmailVerification(cred.user);
            } catch (e) {
                console.warn('No se pudo enviar verificación de correo:', e);
            }

            const extra = {
                firstName: trimmedFirst,
                lastName: trimmedLast,
                rut,
                address: { street: trimmedStreet, region, comuna, country },
                email: trimmedEmail
            };
            localStorage.setItem('user_profile_extra', JSON.stringify(extra));
            alert(t('auth.verification_resent'));
            navigate('/iniciar-sesion');
        } catch (error) {
            console.error('Signup error:', error);
            if (error.code === 'auth/email-already-in-use') {
                setError(t('auth.errors.email_in_use', 'Ya existe una cuenta con este correo electrónico'));
            } else if (error.code === 'auth/invalid-email') {
                setError(t('auth.errors.invalid_email', 'El correo electrónico no es válido'));
            } else if (error.code === 'auth/weak-password') {
                setError(t('auth.errors.weak_password', 'La contraseña es muy débil'));
            } else if (error.code === 'auth/network-request-failed') {
                setError(t('auth.errors.network_error', 'Problema de conexión. Verifica tu internet e inténtalo de nuevo.'));
            } else {
                setError(error.message || t('auth.signup_error', 'Error al registrarse'));
            }
        }

        setLoading(false);
    };

    const handleGoogleSignUp = async () => {
        try {
            setLoading(true);
            setError(''); // Limpiar errores previos

            // Iniciar autenticación con Google
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Actualizar el perfil con el nombre completo si está disponible
            if (user && !user.displayName) {
                const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ');
                if (displayName) {
                    await updateProfile(user, { displayName });
                }
            }

            // Redirigir al dashboard o página de inicio después de registro exitoso
            navigate('/');
        } catch (error) {
            console.error('Error en registro con Google:', error);
            // Manejo de errores específico
            if (error.code === 'auth/account-exists-with-different-credential') {
                setError('Ya existe una cuenta con este correo electrónico. Por favor inicia sesión con el método de autenticación original.');
            } else if (error.code === 'auth/popup-closed-by-user') {
                // No mostrar error si el usuario cierra el popup
                console.log('El usuario cerró la ventana de inicio de sesión');
            } else if (error.code === 'auth/cancelled-popup-request') {
                // No mostrar error si se cancela la solicitud
                console.log('Solicitud de inicio de sesión cancelada');
            } else {
                setError('Error al intentar registrarse con Google. Por favor, inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="shadow-sm">
                        <Card.Body className="p-4 auth-register">
                            <h2 className="text-center mb-3">{t('auth.register_title', 'Crear Cuenta')}</h2>
                            <p className="text-muted">Únete a nuestra comunidad</p>
                        </Card.Body>

                        {error && <Alert variant="danger">{error}</Alert>}
                        <p className="small text-muted">Los campos marcados con <span className="text-danger">*</span> son obligatorios.</p>

                        <Form noValidate validated={validated} onSubmit={handleSubmit}>
                            <Row>
                                <Col md={6}>
                                    <Form.Floating className="mb-3" controlId="formFirstName">
                                        <Form.Control
                                            id="registerFirstName"
                                            type="text"
                                            placeholder={t('labels.first_name')}
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                        />
                                        <label htmlFor="registerFirstName">{t('labels.first_name', 'Nombre')} <span className="text-danger">*</span></label>
                                        <Form.Control.Feedback type="invalid">Por favor ingresa tu nombre.</Form.Control.Feedback>
                                    </Form.Floating>
                                </Col>
                                <Col md={6}>
                                    <Form.Floating className="mb-3" controlId="formLastName">
                                        <Form.Control
                                            id="registerLastName"
                                            type="text"
                                            placeholder={t('labels.last_name')}
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            required
                                        />
                                        <label htmlFor="registerLastName">{t('labels.last_name', 'Apellido')} <span className="text-danger">*</span></label>
                                        <Form.Control.Feedback type="invalid">Por favor ingresa tu apellido.</Form.Control.Feedback>
                                    </Form.Floating>
                                </Col>
                            </Row>

                            <Form.Floating className="mb-3" controlId="formRut">
                                <Form.Control
                                    id="registerRut"
                                    type="text"
                                    placeholder={t('labels.rut')}
                                    value={rut}
                                    onChange={(e) => setRut(e.target.value)}
                                />
                                <label htmlFor="registerRut">{t('labels.rut', 'RUT')}</label>
                            </Form.Floating>

                            <Form.Floating className="mb-3" controlId="formBasicEmail">
                                <Form.Control
                                    id="registerEmail"
                                    type="email"
                                    placeholder={t('labels.email_placeholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <label htmlFor="registerEmail">{t('labels.email', 'Correo electrónico')} <span className="text-danger">*</span></label>
                                <Form.Control.Feedback type="invalid">Ingresa un correo válido (ej: usuario@dominio.com).</Form.Control.Feedback>
                            </Form.Floating>

                            <Form.Floating className="mb-3" controlId="formStreet">
                                <Form.Control
                                    id="registerStreet"
                                    type="text"
                                    placeholder={t('labels.street')}
                                    value={street}
                                    onChange={(e) => setStreet(e.target.value)}
                                    required
                                />
                                <label htmlFor="registerStreet">{t('labels.street', 'Dirección (calle y número)')}</label>
                                <Form.Control.Feedback type="invalid">Ingresa tu calle y número.</Form.Control.Feedback>
                            </Form.Floating>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="formRegion">
                                        <Form.Select value={country} onChange={handleCountryChange} className="mb-2">
                                            {countries.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                            <option value="Otro">Otro</option>
                                        </Form.Select>
                                        <Form.Select
                                            value={region}
                                            onChange={handleRegionChange}
                                            disabled={!countries.includes(country)}
                                            required
                                        >
                                            <option value="">Selecciona región</option>
                                            {regions.map((r) => (
                                                <option key={r} value={r}>{r}</option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">Selecciona una región.</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="formComuna">
                                        <Form.Select
                                            value={comuna}
                                            onChange={(e) => setComuna(e.target.value)}
                                            disabled={!region}
                                            required
                                        >
                                            <option value="">Selecciona comuna</option>
                                            {comunas.map((co) => (
                                                <option key={co} value={co}>{co}</option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">Selecciona una comuna.</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="mb-3 position-relative">
                                <Form.Floating controlId="formBasicPassword">
                                    <Form.Control
                                        id="registerPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder={t('labels.password_placeholder')}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <label htmlFor="registerPassword">{t('labels.password', 'Contraseña')} <span className="text-danger">*</span></label>
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
                                <Form.Text className="text-muted d-block mt-1">Mínimo 6 caracteres</Form.Text>
                            </div>

                            <div className="mb-4 position-relative">
                                <Form.Floating controlId="formBasicConfirmPassword">
                                    <Form.Control
                                        id="registerConfirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder={t('labels.password_placeholder')}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <label htmlFor="registerConfirmPassword">{t('labels.confirm_password', 'Confirmar Contraseña')} <span className="text-danger">*</span></label>
                                </Form.Floating>
                                <Button
                                    type="button"
                                    variant="outline-secondary"
                                    className="toggle-pass"
                                    onClick={() => setShowConfirmPassword(s => !s)}
                                    aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </Button>
                                <Form.Control.Feedback type="invalid">Confirma tu contraseña.</Form.Control.Feedback>
                            </div>

                            <Button
                                variant="success"
                                type="submit"
                                className="w-100 mt-2"
                                disabled={loading}
                            >
                                {loading ? 'Registrando...' : t('buttons.sign_up', 'Registrarse')}
                            </Button>

                            <div className="position-relative text-center my-4">
                                <div className="border-bottom"></div>
                                <span className="bg-white px-2 text-muted" style={{position: 'relative', top: '-12px'}}>O</span>
                            </div>

                            <Button
                                variant="outline-danger"
                                className="w-100 mb-3 d-flex align-items-center justify-content-center"
                                onClick={handleGoogleSignUp}
                                disabled={loading}
                            >
                                <FaGoogle className="me-2" /> {t('buttons.sign_up_with_google', 'Continuar con Google')}
                            </Button>

                            <div className="text-center mt-3">
                                <small>{t('auth.have_account', '¿Ya tienes cuenta?')} <Link to="/iniciar-sesion">{t('buttons.sign_in', 'Inicia sesión')}</Link></small>
                            </div>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default RegisterForm;