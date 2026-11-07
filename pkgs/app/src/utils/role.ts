export type Role = 'shipper' | 'carrier' | 'verifier' | 'auditor';

const ROLE_STORAGE_KEY = 'thermoseal_role';

/** Get the current role from localStorage (defaults to 'shipper' if unset) */
export function getCurrentRole(): Role {
  if (typeof window === 'undefined') return 'shipper';
  const stored = localStorage.getItem(ROLE_STORAGE_KEY) as Role;
  return stored || 'shipper';
}

/** Set the active persona role and notify listeners */
export function setRole(role: Role): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ROLE_STORAGE_KEY, role);
  window.dispatchEvent(new Event('role-changed'));
}

/** Client-side route guard function */
export function requireRole(required: Role): Role {
  const role = getCurrentRole();
  if (role !== required && role !== 'verifier') {
    throw new Error(`Role '${role}' is not authorized to access the '${required}' area`);
  }
  return role;
}