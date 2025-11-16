import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Table, 
  Button, 
  Modal, 
  Form,
  Alert,
  Badge,
  Card
} from 'react-bootstrap';
import { FaEdit, FaTrash, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const AdminUsers = () => {
  const { currentUser, getAllUsers, updateUser, deleteUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    role: 'user',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Actualizar el usuario existente
        const updatedUser = await updateUser(editingUser.uid, formData);
        
        // Actualizar la lista de usuarios en el estado sin recargar
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.uid === updatedUser.uid ? { ...user, ...formData } : user
          )
        );
        
        setSuccess('Usuario actualizado correctamente');
      } else {
        // En una aplicación real, aquí se crearía el usuario
        setError('La creación de usuarios se realiza desde el formulario de registro');
        return;
      }
      
      handleCloseModal();
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error al guardar el usuario: ' + error.message);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      displayName: user.displayName || '',
      email: user.email || '',
      role: user.role || 'user',
      phone: user.phone || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (userId === currentUser.uid) {
      setError('No puedes eliminar tu propio usuario');
      return;
    }
    
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
      try {
        await deleteUser(userId);
        loadUsers();
        setSuccess('Usuario eliminado correctamente');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Error al eliminar el usuario: ' + error.message);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      displayName: '',
      email: '',
      role: 'user',
      phone: ''
    });
    setError('');
  };

  // Verify if user is admin
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <Container className="mt-5">
        <div className="alert alert-danger">Acceso denegado. No tienes permisos de administrador.</div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Usuarios</h2>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="shadow-sm">
        <Card.Body>
          <Table hover responsive>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Teléfono</th>
                <th>Fecha de Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.uid}>
                    <td className="align-middle">
                      {user.displayName || 'Sin nombre'}
                    </td>
                    <td className="align-middle">{user.email}</td>
                    <td className="align-middle">
                      <Badge bg={user.role === 'admin' ? 'primary' : 'secondary'}>
                        {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                      </Badge>
                    </td>
                    <td className="align-middle">{user.phone || 'No especificado'}</td>
                    <td className="align-middle">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="align-middle">
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleEdit(user)}
                        title="Editar usuario"
                      >
                        <FaEdit />
                      </Button>
                      {user.uid !== currentUser.uid && (
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDelete(user.uid)}
                          title="Eliminar usuario"
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Edit User Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuario</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!!editingUser}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+56 9 1234 5678"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                disabled={editingUser?.uid === currentUser?.uid}
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </Form.Select>
              {editingUser?.uid === currentUser?.uid && (
                <Form.Text className="text-muted">
                  No puedes cambiar tu propio rol por seguridad.
                </Form.Text>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar Cambios
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminUsers;
