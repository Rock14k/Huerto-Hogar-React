import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase/config';

// Admin emails - these users will have admin privileges
const ADMIN_EMAILS = [
  'huertohogar.info@gmail.com',
  'ha.durant@duocuc.cl'
];

// User roles
const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

// Get user role based on email
const getUserRole = (email) => {
  return ADMIN_EMAILS.includes(email) ? ROLES.ADMIN : ROLES.USER;
};

// Get users from localStorage
const getUsers = () => {
  return JSON.parse(localStorage.getItem('users') || '[]');
};

// Save users to localStorage
const saveUsers = (users) => {
  localStorage.setItem('users', JSON.stringify(users));
};

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState(getUsers());

  // Registrar un nuevo usuario
  const signup = async (email, password, userData = {}) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
      
      // Create user object with role
      const newUser = {
        uid: user.uid,
        email: user.email,
        role: getUserRole(user.email),
        ...userData,
        createdAt: new Date().toISOString()
      };
      
      // Save user to local storage
      const updatedUsers = [...users, newUser];
      saveUsers(updatedUsers);
      setUsers(updatedUsers);
      
      return userCredential;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Iniciar sesión con correo y contraseña
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Iniciar sesión con Google
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      setError(error.message);
    }
  };

  // Cerrar sesión
  const logout = () => {
    return signOut(auth);
  };

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Find user in our local storage to get role
        const userInDb = users.find(u => u.uid === user.uid) || {
          uid: user.uid,
          email: user.email,
          role: getUserRole(user.email),
          displayName: user.displayName || '',
          photoURL: user.photoURL || ''
        };
        
        // Update user in state with role
        setCurrentUser({
          ...user,
          role: userInDb.role,
          ...userInDb
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [users]);

  // Get all users (admin only)
  const getAllUsers = () => {
    return users;
  };

  // Update user (admin only)
  const updateUser = (userId, updates) => {
    const updatedUsers = users.map(user => 
      user.uid === userId ? { ...user, ...updates } : user
    );
    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    
    // Update current user if it's the current user being updated
    if (currentUser && currentUser.uid === userId) {
      setCurrentUser(prev => ({
        ...prev,
        ...updates
      }));
    }
    
    return updatedUsers.find(user => user.uid === userId);
  };

  // Delete user (admin only)
  const deleteUser = (userId) => {
    if (currentUser.uid === userId) {
      throw new Error('No puedes eliminar tu propio usuario');
    }
    const updatedUsers = users.filter(user => user.uid !== userId);
    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    return true;
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loginWithGoogle,
    error,
    setError,
    // Admin functions
    getAllUsers,
    updateUser,
    deleteUser,
    ROLES
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
