/**
 * Utility functions for role parsing and role-based route redirection
 */

export const getUserRole = (user) => {
  if (!user) return 'requester';
  let roleName = '';
  
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    const firstRole = user.roles[0];
    roleName = typeof firstRole === 'string' ? firstRole : (firstRole?.name || '');
  } else if (typeof user.role === 'string') {
    roleName = user.role;
  } else if (typeof user.role === 'object' && user.role !== null) {
    roleName = user.role.name || '';
  }
  
  return (roleName || 'requester').toLowerCase();
};

export const getRoleRedirectPath = (user) => {
  const role = getUserRole(user);
  
  if (role.includes('admin') || role.includes('superadmin')) {
    return '/admin';
  } else if (role.includes('reviewer') || role.includes('legal')) {
    return '/reviewer';
  } else if (role.includes('contract_manager') || role.includes('manager') || role.includes('cm')) {
    return '/cm/contracts';
  } else {
    return '/requestor';
  }
};
