import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const useAuthGuard = (requireAuth = true, redirectTo = '/login') => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    // If authentication is required but user is not authenticated, redirect to login
    if (requireAuth && !isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
    // If authentication is not required but user is authenticated, redirect to home
    else if (!requireAuth && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo, requireAuth]);

  return { isAuthenticated, isLoading };
};

export const useRequireAuth = (redirectTo = '/login') => {
  return useAuthGuard(true, redirectTo);
};

export const useRequireNoAuth = (redirectTo = '/') => {
  return useAuthGuard(false, redirectTo);
};
