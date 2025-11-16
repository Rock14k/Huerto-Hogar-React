import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Table, 
  Button, 
  Modal, 
  Form,
  Alert,
  Row,
  Col,
  Card,
  Badge
} from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { products as sourceProducts } from '../../data/products';

const AdminProducts = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image: '/static/img/placeholder-product.jpg' // Default placeholder image
  });
  
  // Handle local image paths
  const processImagePath = (path) => {
    if (!path) return '/static/img/placeholder-product.jpg';
    // If it's a local path, make sure it's relative to the public folder
    if (path.startsWith('/static/')) return path;
    // If it's a full URL, use it as is
    if (path.startsWith('http')) return path;
    // For other cases, assume it's a local path
    return path.startsWith('/') ? path : `/${path}`;
  };
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load products from source and sync with localStorage
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    // Get products from localStorage or initialize with source products
    let storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    
    // If no products in localStorage, initialize with source products
    if (storedProducts.length === 0) {
      storedProducts = sourceProducts.map(product => ({
        ...product,
        stock: product.stock || 10, // Default stock if not defined
        price: product.price || 0,
        status: 'active',
        purchaseCount: 0 // Initialize purchase count
      }));
      localStorage.setItem('products', JSON.stringify(storedProducts));
    }
    
    setProducts(storedProducts);
  };

  const saveProducts = (productsList) => {
    localStorage.setItem('products', JSON.stringify(productsList));
    setProducts(productsList);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      const productsList = [...products];
      const productData = {
        ...formData,
        // Ensure price and stock are numbers
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
        // Process image path
        image: processImagePath(formData.image)
      };
      
      if (editingProduct) {
        // Update existing product
        const index = productsList.findIndex(p => p.id === editingProduct.id);
        if (index !== -1) {
          // Preserve existing image if not changed
          const updatedProduct = { 
            ...editingProduct, 
            ...productData,
            // Only update image if a new one was provided
            image: formData.image ? productData.image : editingProduct.image,
            updatedAt: new Date().toISOString()
          };
          productsList[index] = updatedProduct;
          setSuccess('Producto actualizado correctamente');
        }
      } else {
        // Add new product
        const newProduct = {
          id: `prod_${Date.now()}`,
          ...productData,
          purchaseCount: 0, // Initialize purchase count
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        productsList.push(newProduct);
        setSuccess('Producto agregado correctamente');
      }
      
      saveProducts(productsList);
      handleCloseModal();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error al guardar el producto: ' + error.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stock || '',
      category: product.category || '',
      image: product.image || ''
    });
    setShowModal(true);
  };

  const handleDelete = (productId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      const updatedProducts = products.filter(p => p.id !== productId);
      saveProducts(updatedProducts);
      setSuccess('Producto eliminado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const toggleProductStatus = (productId) => {
    const updatedProducts = products.map(p => 
      p.id === productId 
        ? { ...p, status: p.status === 'active' ? 'paused' : 'active' }
        : p
    );
    saveProducts(updatedProducts);
    setSuccess(`Producto ${updatedProducts.find(p => p.id === productId).status === 'active' ? 'activado' : 'pausado'} correctamente`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      image: ''
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
        <h2>Gestión de Productos</h2>
        <Button 
          variant="primary" 
          onClick={() => setShowModal(true)}
        >
          <FaPlus className="me-2" /> Nuevo Producto
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="shadow-sm">
        <Card.Body>
          <Table hover responsive>
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    No hay productos registrados
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id}>
                    <td>
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div 
                          className="bg-light d-flex align-items-center justify-content-center" 
                          style={{ width: '50px', height: '50px' }}
                        >
                          <small className="text-muted">Sin imagen</small>
                        </div>
                      )}
                    </td>
                    <td className="align-middle">{product.name}</td>
                    <td className="align-middle">${product.price.toLocaleString()}</td>
                    <td className="align-middle">
                      <Badge bg={product.stock > 0 ? 'success' : 'danger'}>
                        {product.stock} en stock
                      </Badge>
                    </td>
                    <td className="align-middle">{product.category || 'Sin categoría'}</td>
                    <td className="align-middle">
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleEdit(product)}
                      >
                        <FaEdit />
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add/Edit Product Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre del Producto *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Precio *</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock *</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Imagen</Form.Label>
                  <Form.Control
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="URL o ruta de la imagen (ej: /static/img/producto.jpg)"
                  />
                  <Form.Text className="text-muted">
                    Deje en blanco para usar la imagen actual
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Control
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Ej: Herramientas, Semillas, etc."
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>URL de la Imagen</Form.Label>
              <Form.Control
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              {formData.image && (
                <div className="mt-2">
                  <p className="small mb-1">Vista previa:</p>
                  <img 
                    src={formData.image} 
                    alt="Vista previa" 
                    style={{ maxWidth: '100px', maxHeight: '100px' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/100';
                    }}
                  />
                </div>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingProduct ? 'Actualizar' : 'Guardar'} Producto
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminProducts;
