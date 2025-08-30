import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const INACTIVITY_LIMIT_MS = 60 * 60 * 1000; // 1 hour

function parseJwt(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload || {};
  } catch {
    return {};
  }
}

export default function ProtectedRoute({ allowedRole, children }) {
  const location = useLocation();
  const token = localStorage.getItem('authToken');
  const lastActive = parseInt(localStorage.getItem('lastActive') || '0', 10);
  const now = Date.now();

  // not logged in or idle for too long
  if (!token || (now - lastActive > INACTIVITY_LIMIT_MS)) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('lastActive');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // optional: JWT exp check (if your JWT has exp)
  const { exp, role: tokenRole } = parseJwt(token);
  if (exp && now >= exp * 1000) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('lastActive');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // role gate (read from token OR localStorage fallback)
  const storedRole = localStorage.getItem('userRole');
  const effectiveRole = tokenRole || storedRole; // whichever you have
  if (allowedRole && effectiveRole !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
