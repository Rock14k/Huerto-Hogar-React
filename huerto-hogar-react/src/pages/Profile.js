import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Tabs, InputGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { auth, storage } from '../firebase/config';
import { updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { FaUser, FaLock, FaHistory, FaMapMarkerAlt, FaPhone, FaEnvelope, FaEye, FaEyeSlash, FaCamera } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const fileInputRef = useRef(null);
  const [avatarSize, setAvatarSize] = useState(140); // px
  
  // Datos del perfil
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    phone: '',
    address: ''
  });
  
  // Datos para cambiar contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
        phone: currentUser.phoneNumber || '',
        address: currentUser.address || ''
      });
      const lsAvatar = (typeof window !== 'undefined' && localStorage.getItem('profilePicUrl')) || '';
      setAvatarPreview(currentUser.photoURL || lsAvatar);
    }
  }, [currentUser]);

  // Responsivo: ajustar tamaño del avatar según el viewport
  useEffect(() => {
    const updateSize = () => {
      if (typeof window === 'undefined') return;
      const w = window.innerWidth;
      // xs/sm: 110px, md+: 140px
      setAvatarSize(w < 576 ? 110 : 140);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onAvatarChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
    // Subida inmediata
    if (!currentUser) return;
    setAvatarUploading(true);
    try {
      const path = `users/${currentUser.uid}/avatar_${Date.now()}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, f);
      const url = await getDownloadURL(storageRef);
      await updateProfile(auth.currentUser, { photoURL: url });
      try { await auth.currentUser?.reload(); } catch {}
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('profilePicUrl', url); } catch {}
      }
      setAvatarPreview(auth.currentUser?.photoURL || url);
      setMessage(t('profile.photo_updated', 'Foto de perfil actualizada'));
    } catch (err) {
      console.error('Avatar upload error:', err);
      setError(t('errors.try_again_later'));
    }
    setAvatarUploading(false);
  };

  const uploadAvatar = async () => {
    if (!currentUser || !avatarFile) return;
    setAvatarUploading(true);
    try {
      const path = `users/${currentUser.uid}/avatar_${Date.now()}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, avatarFile);
      const url = await getDownloadURL(storageRef);
      await updateProfile(auth.currentUser, { photoURL: url });
      setAvatarPreview(url);
      setMessage(t('profile.photo_updated', 'Foto de perfil actualizada'));
    } catch (e) {
      console.error('Avatar upload error:', e);
      setError(t('errors.try_again_later'));
    }
    setAvatarUploading(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // Actualizar el perfil en Firebase
      await updateProfile(auth.currentUser, {
        displayName: profileData.displayName
      });

      // Actualizar el correo electrónico si ha cambiado
      if (profileData.email !== currentUser.email) {
        await updateEmail(auth.currentUser, profileData.email);
      }

      setMessage('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      setError('Error al actualizar el perfil: ' + error.message);
    }

    setLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }
    
    if (passwordData.newPassword.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres');
    }
    
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordData.currentPassword
      );
      
      // Reautenticar al usuario
      await reauthenticateWithCredential(user, credential);
      
      // Actualizar la contraseña
      await updatePassword(user, passwordData.newPassword);
      
      setMessage('Contraseña actualizada correctamente');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error al actualizar la contraseña:', error);
      setError('Error al actualizar la contraseña: ' + error.message);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setError('Error al cerrar sesión');
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <h1 className="mb-4">
            <span className="text-primary">{t('profile.title_prefix', 'Mi')}</span>
            <span className="text-danger"> {t('profile.title_suffix', 'Cuenta')}</span>
          </h1>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          
          <Tabs defaultActiveKey="profile" id="profile-tabs" className="mb-4">
            <Tab eventKey="profile" title={t('profile.tab_profile', 'Perfil')}>
              <Card className="shadow-sm mt-4">
                <Card.Body>
                  {/* Avatar responsive (centrado y sobresaliendo la mitad sobre la línea superior) */}
                  <div className="position-relative mb-4" style={{ paddingTop: avatarSize / 2 }}>
                    <div className="position-absolute" style={{ top: -(avatarSize / 2), left: '50%', transform: 'translateX(-50%)' }}>
                      <div className="position-relative d-inline-block" style={{ width: avatarSize, height: avatarSize }}>
                        <div
                          style={{ width: '100%', height: '100%', borderRadius: '50%', border: '3px solid #3CB815', overflow: 'hidden', backgroundColor: avatarPreview ? '#fff' : '#6c757d' }}
                          onClick={() => fileInputRef.current && fileInputRef.current.click()}
                          role="button"
                          aria-label={t('profile.upload_photo', 'Subir foto')}
                        >
                          {avatarPreview ? (
                            <img
                              src={avatarPreview}
                              alt="avatar"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontWeight: 600,
                                textTransform: 'lowercase'
                              }}
                            >
                              {t('profile.avatar_text', 'avatar')}
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          className="position-absolute d-flex align-items-center justify-content-center p-0"
                          style={{ bottom: 2, right: avatarSize < 140 ? 8 : 10, width: avatarSize < 140 ? 24 : 28, height: avatarSize < 140 ? 24 : 28, borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.25)', zIndex: 5 }}
                          variant="success"
                          onClick={() => fileInputRef.current && fileInputRef.current.click()}
                          aria-label={t('profile.upload_photo', 'Subir foto')}
                        >
                          <FaCamera size={avatarSize < 140 ? 11 : 12} />
                        </Button>
                      </div>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={onAvatarChange} className="d-none" />
                  </div>
                  <Form onSubmit={handleProfileSubmit}>
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Floating controlId="formName">
                          <Form.Control 
                            type="text" 
                            name="displayName"
                            value={profileData.displayName}
                            onChange={handleProfileChange}
                            placeholder={t('labels.name', 'Nombre completo')}
                            required 
                          />
                          <label htmlFor="formName"><FaUser className="me-2" /> {t('labels.name', 'Nombre completo')}</label>
                        </Form.Floating>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Floating controlId="formEmail">
                          <Form.Control 
                            type="email" 
                            name="email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                            placeholder={t('labels.email', 'Correo electrónico')}
                            required 
                          />
                          <label htmlFor="formEmail"><FaEnvelope className="me-2" /> {t('labels.email', 'Correo electrónico')}</label>
                        </Form.Floating>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Floating controlId="formPhone">
                          <Form.Control 
                            type="tel" 
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            placeholder={t('labels.phone', 'Teléfono')}
                          />
                          <label htmlFor="formPhone"><FaPhone className="me-2" /> {t('labels.phone', 'Teléfono')}</label>
                        </Form.Floating>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Floating controlId="formAddress">
                          <Form.Control 
                            type="text" 
                            name="address"
                            value={profileData.address}
                            onChange={handleProfileChange}
                            placeholder={t('labels.address', 'Dirección')}
                          />
                          <label htmlFor="formAddress"><FaMapMarkerAlt className="me-2" /> {t('labels.address', 'Dirección')}</label>
                        </Form.Floating>
                      </Col>
                      <Col xs={12} className="mt-3">
                        <Button variant="success" type="submit" disabled={loading}>
                          {loading ? t('common.loading', 'Cargando...') : t('profile.save_changes', 'Guardar Cambios')}
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="password" title={t('profile.tab_security', 'Seguridad')}>
              <Card className="shadow-sm mt-4">
                <Card.Body>
                  <Form onSubmit={handlePasswordSubmit}>
                    <Row>
                      <Col md={12} className="mb-3">
                        <Form.Group controlId="formCurrentPassword">
                          <Form.Label><FaLock className="me-2" /> {t('profile.current_password', 'Contraseña actual')}</Form.Label>
                          <InputGroup>
                            <Form.Control 
                              type={showPwd.current ? 'text' : 'password'} 
                              name="currentPassword"
                              value={passwordData.currentPassword}
                              onChange={handlePasswordChange}
                              required 
                            />
                            <Button 
                              variant="outline-secondary" 
                              onClick={() => setShowPwd(p => ({ ...p, current: !p.current }))}
                              aria-label={showPwd.current ? t('auth.hide_password', 'Ocultar contraseña') : t('auth.show_password', 'Mostrar contraseña')}
                            >
                              {showPwd.current ? <FaEyeSlash /> : <FaEye />}
                            </Button>
                          </InputGroup>
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group controlId="formNewPassword">
                          <Form.Label>{t('profile.new_password', 'Nueva contraseña')}</Form.Label>
                          <InputGroup>
                            <Form.Control 
                              type={showPwd.new ? 'text' : 'password'} 
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              required 
                            />
                            <Button 
                              variant="outline-secondary" 
                              onClick={() => setShowPwd(p => ({ ...p, new: !p.new }))}
                              aria-label={showPwd.new ? t('auth.hide_password', 'Ocultar contraseña') : t('auth.show_password', 'Mostrar contraseña')}
                            >
                              {showPwd.new ? <FaEyeSlash /> : <FaEye />}
                            </Button>
                          </InputGroup>
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group controlId="formConfirmPassword">
                          <Form.Label>{t('profile.confirm_new_password', 'Confirmar nueva contraseña')}</Form.Label>
                          <InputGroup>
                            <Form.Control 
                              type={showPwd.confirm ? 'text' : 'password'} 
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              required 
                            />
                            <Button 
                              variant="outline-secondary" 
                              onClick={() => setShowPwd(p => ({ ...p, confirm: !p.confirm }))}
                              aria-label={showPwd.confirm ? t('auth.hide_password', 'Ocultar contraseña') : t('auth.show_password', 'Mostrar contraseña')}
                            >
                              {showPwd.confirm ? <FaEyeSlash /> : <FaEye />}
                            </Button>
                          </InputGroup>
                        </Form.Group>
                      </Col>
                      <Col xs={12} className="mt-3">
                        <Button variant="success" type="submit" disabled={loading}>
                          {loading ? t('common.loading', 'Cargando...') : t('profile.update_password', 'Actualizar Contraseña')}
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="orders" title={t('profile.tab_orders', 'Mis Pedidos')}>
              <Card className="shadow-sm mt-4">
                <Card.Body>
                  <div className="text-center py-5">
                    <FaHistory size={48} className="text-muted mb-3" />
                    <h4>{t('orders.title', 'Historial de Compras')}</h4>
                    <p className="text-muted">{t('profile.orders_hint', 'Aquí podrás ver el historial de tus pedidos realizados.')}</p>
                    <Button variant="outline-success" onClick={() => window.location.href='/historial-compras'}>
                      {t('profile.view_orders', 'Ver mis pedidos')}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>

          {/* Logout button aligned right, outside the card */}
          <div className="text-end pt-3">
            <Button variant="outline-danger" onClick={handleLogout}>
              {t('profile.logout', 'Cerrar Sesión')}
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
