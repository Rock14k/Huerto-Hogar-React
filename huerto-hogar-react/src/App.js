import React from 'react';
import './i18n';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Firebase
import { auth } from './firebase/config';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Page Components
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPassword from './components/auth/ForgotPassword';
import Profile from './pages/Profile';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import CartPage from './pages/CartPage'; // Asegúrate de crear este componente
import OrderHistory from './pages/OrderHistory';
import NotFound from './pages/NotFound';
import CartSidebar from './components/cart/CartSidebar';

// Admin Components
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrders from './pages/admin/AdminOrders';
import SalesReport from './pages/admin/SalesReport';
import SalesManagement from './pages/admin/SalesManagement';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// Private Route Component
const PrivateRoute = ({ children }) => {
    const { currentUser } = useAuth();
    return currentUser ? children : <Navigate to="/iniciar-sesion" />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
    const { currentUser } = useAuth();
    return currentUser?.role === 'admin' ? children : <Navigate to="/" />;
};

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <div className="App d-flex flex-column min-vh-100">
                        <Header />
                        <main className="flex-grow-1">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/nosotros" element={<About />} />
                                <Route path="/productos" element={<Products />} />
                                <Route path="/productos/:id" element={<ProductDetail />} />
                                <Route path="/contacto" element={<Contact />} />
                                <Route path="/blog" element={<Blog />} />

                                {/* Authentication Routes */}
                                <Route path="/iniciar-sesion" element={<LoginForm />} />
                                <Route path="/registro" element={<RegisterForm />} />
                                <Route path="/olvide-contrasena" element={<ForgotPassword />} />

                                {/* Protected Routes */}
                                <Route
                                    path="/perfil"
                                    element={
                                        <PrivateRoute>
                                            <Profile />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/carrito"
                                    element={
                                        <PrivateRoute>
                                            <CartPage />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/checkout"
                                    element={
                                        <PrivateRoute>
                                            <Checkout />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/historial-compras"
                                    element={
                                        <PrivateRoute>
                                            <OrderHistory />
                                        </PrivateRoute>
                                    }
                                />

                                {/* Admin Routes */}
                                <Route
                                    path="/admin"
                                    element={
                                        <PrivateRoute>
                                            <AdminRoute>
                                                <AdminDashboard />
                                            </AdminRoute>
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/admin/productos"
                                    element={
                                        <PrivateRoute>
                                            <AdminRoute>
                                                <AdminProducts />
                                            </AdminRoute>
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/admin/usuarios"
                                    element={
                                        <PrivateRoute>
                                            <AdminRoute>
                                                <AdminUsers />
                                            </AdminRoute>
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/admin/ordenes"
                                    element={
                                        <PrivateRoute>
                                            <AdminRoute>
                                                <AdminOrders />
                                            </AdminRoute>
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/admin/reportes"
                                    element={
                                        <PrivateRoute>
                                            <AdminRoute>
                                                <SalesReport />
                                            </AdminRoute>
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/admin/ventas"
                                    element={
                                        <PrivateRoute>
                                            <AdminRoute>
                                                <SalesManagement />
                                            </AdminRoute>
                                        </PrivateRoute>
                                    }
                                />

                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </main>
                        <Footer />
                        <CartSidebar />
                    </div>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;