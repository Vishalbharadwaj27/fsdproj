export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member' | 'viewer';
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  userId: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: string;
  user?: Pick<User, 'id' | 'name' | 'email' | 'avatar'>;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData extends Omit<LoginCredentials, 'rememberMe'> {
  name: string;
  confirmPassword: string;
}

export interface PasswordResetData {
  token: string;
  password: string;
}

export interface UpdateProfileData {
  name: string;
  avatar?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

export interface InviteTeamMemberData {
  email: string;
  role: 'admin' | 'member' | 'viewer';
  message?: string;
}

export interface UpdateTeamMemberRoleData {
  userId: string;
  role: 'admin' | 'member' | 'viewer';
}
