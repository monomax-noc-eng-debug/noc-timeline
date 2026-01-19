import { Navigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { hasRole } from '../../utils/permissions';

/**
 * ProtectedRoute: Check access rights
 * If no user logged in (currentUser) -> Redirect to /login
 * If allowedRoles defined and user doesn't have permission -> Redirect to /
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const currentUser = useStore((state) => state.currentUser);

  if (!currentUser) return <Navigate to="/login" replace />;

  if (allowedRoles && !hasRole(currentUser, allowedRoles)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
