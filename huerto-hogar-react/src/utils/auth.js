/**
 * Verifica si el usuario actual es administrador
 * @param {Object} user - Objeto de usuario de Firebase
 * @returns {boolean} - True si el usuario es administrador
 */
export const isAdmin = (user) => {
  // Verificar si el usuario existe y tiene el claim de administrador
  // o si el correo electrónico está en la lista de administradores
  if (!user) return false;
  
  // Lista de correos electrónicos de administradores
  const adminEmails = [
    'admin@huertohogar.com',
    'juan.perez@example.com'
    // Agrega más correos de administradores según sea necesario
  ];
  
  // Verificar si el correo del usuario está en la lista de administradores
  return adminEmails.includes(user.email);
};

/**
 * Verifica si el usuario está autenticado
 * @param {Object} user - Objeto de usuario de Firebase
 * @returns {boolean} - True si el usuario está autenticado
 */
export const isAuthenticated = (user) => {
  return !!user;
};
