import axios from 'axios';
import { 
  User, 
  LoginCredentials, 
  RegisterData, 
  PasswordResetData, 
  UpdateProfileData, 
  InviteTeamMemberData, 
  UpdateTeamMemberRoleData,
  Team,
  TeamMember
} from '@/types/auth'; 

type ApiResponse<T> = {
  data: T;
  message?: string;
};

type LoginResponse = {
  user: User;
  token: string;
};

type UserResponse = {
  user: User;
};

type MessageResponse = {
  message: string;
};

type TeamsResponse = {
  teams: Team[];
};

type TeamResponse = {
  team: Team;
};

const AUTH_TOKEN_KEY = 'task_trailblazer_auth_token';

// Mock user data for demo purposes
const mockUser = {
  id: '1',
  name: 'Demo User',
  email: 'demo@example.com',
  avatar: null,
  role: 'admin' as const, // Using 'as const' to ensure type safety
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock token for authentication
const MOCK_TOKEN = 'mock-jwt-token-for-demo';

// Simulate API delay
const simulateApiCall = (data: any, delay = 800) => 
  new Promise(resolve => setTimeout(() => resolve({ data }), delay));

export const authService = {
  // Authentication methods
  async login(credentials) {
    // Accept any email/password for demo
    await simulateApiCall(null);
    
    const response = {
      user: { ...mockUser, email: credentials.email },
      token: MOCK_TOKEN,
    };

    if (credentials.rememberMe) {
      localStorage.setItem(AUTH_TOKEN_KEY, MOCK_TOKEN);
    } else {
      sessionStorage.setItem(AUTH_TOKEN_KEY, MOCK_TOKEN);
    }

    return response;
  },

  async register(userData) {
    await simulateApiCall(null);
    
    const response = {
      user: { ...mockUser, ...userData, id: Date.now().toString() },
      token: MOCK_TOKEN,
    };
    
    localStorage.setItem(AUTH_TOKEN_KEY, MOCK_TOKEN);
    return response;
  },

  logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  },

  async forgotPassword(email) {
    await simulateApiCall(null);
    return { message: 'Password reset link has been sent to your email' };
  },

  async resetPassword(resetData: PasswordResetData) {
    await simulateApiCall(resetData);
    // In a real implementation, you would send the reset data to your API
    // For now, we'll just simulate a successful response
    return { message: 'Your password has been reset successfully' };
  },

  // User profile methods
  async getCurrentUser() {
    await simulateApiCall(null);
    const token = localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return { user: { ...mockUser } };
  },

  async updateProfile(profileData) {
    await simulateApiCall(null);
    return { user: { ...mockUser, ...profileData } };
  },

  // Mock team methods (returning empty arrays/objects for demo)
  async getTeams() {
    await simulateApiCall(null);
    return { teams: [] };
  },

  async createTeam() {
    await simulateApiCall(null);
    return { team: { id: '1', name: 'Demo Team' } };
  },

  async getTeam() {
    await simulateApiCall(null);
    return { team: { id: '1', name: 'Demo Team', members: [] } };
  },

  async updateTeam() {
    await simulateApiCall(null);
    return { team: { id: '1', name: 'Updated Team' } };
  },

  async deleteTeam() {
    await simulateApiCall(null);
    return { message: 'Team deleted successfully' };
  },

  async inviteTeamMember() {
    await simulateApiCall(null);
    return { message: 'Invitation sent successfully' };
  },

  async updateTeamMemberRole() {
    await simulateApiCall(null);
    return { message: 'Team member role updated' };
  },

  async removeTeamMember() {
    await simulateApiCall(null);
    return { message: 'Team member removed' };
  },

  // Token management
  getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
  },

  setAuthToken(token, remember = false) {
    if (remember) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    }
  },

  clearAuthToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  },
};

export default authService;
