import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';

// Simplified types for our mock implementation
type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  avatar?: string | null;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type LoginCredentials = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
};

type PasswordResetData = {
  token: string;
  password: string;
};

type UpdateProfileData = {
  name?: string;
  email?: string;
  avatar?: File | null;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGIN_END' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: UpdateProfileData) => Promise<User>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (resetData: PasswordResetData) => Promise<{ message: string }>;
  loadUser: () => Promise<User>;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_END':
      return {
        ...state,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    ...initialState,
    isLoading: true, // Start with loading true
  });
  const navigate = useNavigate();
  const isMounted = { current: true };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      const token = authService.getAuthToken();
      
      if (!token) {
        if (isMounted.current) {
          dispatch({ type: 'LOGIN_END' });
        }
        return;
      }

      try {
        const { user } = await authService.getCurrentUser();
        if (isMounted.current) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token },
          });
        }
      } catch (error) {
        console.error('Failed to load user', error);
        if (isMounted.current) {
          dispatch({ type: 'LOGIN_FAILURE', payload: 'Failed to load user' });
          authService.clearAuthToken();
        }
      } finally {
        // Ensure loading state is set to false after the check
        if (isMounted.current) {
          dispatch({ type: 'LOGIN_END' });
        }
      }
    };

    loadUser();
  }, [navigate]);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const { user, token } = await authService.login(credentials);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error instanceof Error ? error.message : 'Login failed. Please try again.',
      });
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const { user, token } = await authService.register(userData);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error instanceof Error ? error.message : 'Registration failed. Please try again.',
      });
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  const updateUser = async (userData: UpdateProfileData): Promise<User> => {
    try {
      const { user } = await authService.updateProfile(userData);
      dispatch({
        type: 'UPDATE_USER',
        payload: user,
      });
      return user;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      return await authService.forgotPassword(email);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const resetPassword = async (resetData: PasswordResetData) => {
    try {
      return await authService.resetPassword(resetData);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const loadUser = async (forceReload = false): Promise<User> => {
    try {
      // If we already have a user and don't force reload, return the current user
      if (state.user && !forceReload) {
        return state.user;
      }
      
      const { user } = await authService.getCurrentUser();
      const token = authService.getAuthToken();
      
      if (user && token) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
      }
      return user;
    } catch (error) {
      console.error('Load user error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateUser,
        forgotPassword,
        resetPassword,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
