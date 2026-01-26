import { Navigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { hasRole } from '../../utils/permissions';
import { useAuth } from './AuthProvider';
import PageLoader from '../ui/PageLoader';

/**
 * ProtectedRoute: Check access rights
 * 
 * IMPORTANT: This component uses AuthProvider's loading state to prevent
 * flash redirects during initial auth resolution. Without this, users would
 * briefly see a redirect to /login before auth state is confirmed.
 * 
 * Flow:
 * 1. If auth is loading -> Show loader (prevents flash redirect)
 * 2. If no user logged in (currentUser) -> Redirect to /login
 * 3. If allowedRoles defined and user doesn't have permission -> Redirect to /
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const currentUser = useStore((state) => state.currentUser);
  const { loading } = useAuth();

  // Wait for auth to resolve before making any redirect decision
  if (loading) {
    return <PageLoader />;
  }

  if (!currentUser) return <Navigate to="/login" replace />;

  if (allowedRoles && !hasRole(currentUser, allowedRoles)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

