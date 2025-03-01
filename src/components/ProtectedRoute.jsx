import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDomain } from '../context/DomainContext';

export const ProtectedRoute = ({ children }) => {
  const { currentUser, userProfile, hasStateAccess } = useAuth();
  const domain = useDomain();

  if (!currentUser || !userProfile) {
    return <Navigate to="/" />;
  }

  // Check if user has access to the current domain's state
  const state = domain.state || 'NM';
  if (!hasStateAccess(state) && userProfile.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
}; 