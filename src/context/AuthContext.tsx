import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  UserRole, 
  INITIAL_USERS, 
  validateUsername, 
  validatePassword 
} from '../types/auth';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  register: (
    userData: {
      username: string;
      password: string;
      displayName: string;
      role: UserRole;
      teamId?: string;
      tournamentId?: string;
    }
  ) => { success: boolean; error?: string };
  switchUser: (userId: string) => void;
  canManageTournaments: () => boolean;
  canManageTeams: () => boolean;
  canManageRoster: (teamId?: string) => boolean;
  canEditScores: () => boolean;
  canManageRules: () => boolean;
  canManageSchedules: () => boolean;
  isReadOnly: () => boolean;
  isMaster: () => boolean;
  isReferee: () => boolean;
  isCaptain: () => boolean;
  isPlayer: () => boolean;
}

const STORAGE_USERS_KEY = 'atosport_users';
const STORAGE_CURRENT_USER_KEY = 'atosport_current_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load users from localStorage or initial seed
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error loading users from localStorage:', e);
    }
    return INITIAL_USERS;
  });

  // Load current user from localStorage (default to Master1 for seamless first load, or null if logged out)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error loading current user from localStorage:', e);
    }
    // Default initial session: Master1
    return INITIAL_USERS[0];
  });

  // Sync users with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users to localStorage:', e);
    }
  }, [users]);

  // Sync current user with localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error('Error saving current user to localStorage:', e);
    }
  }, [currentUser]);

  const login = (usernameInput: string, passwordInput: string): { success: boolean; error?: string } => {
    const cleanUsername = usernameInput.trim();

    // Validate requirements first
    const uVal = validateUsername(cleanUsername);
    if (!uVal.isValid) {
      return { success: false, error: uVal.errors.join('. ') };
    }

    const pVal = validatePassword(passwordInput);
    if (!pVal.isValid) {
      return { success: false, error: pVal.errors.join('. ') };
    }

    const found = users.find(
      (u) => u.username.toLowerCase() === cleanUsername.toLowerCase()
    );

    if (!found) {
      return { success: false, error: 'Usuario no encontrado en el sistema.' };
    }

    if (found.password !== passwordInput) {
      return { success: false, error: 'Contraseña incorrecta para este usuario.' };
    }

    setCurrentUser(found);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = (userData: {
    username: string;
    password: string;
    displayName: string;
    role: UserRole;
    teamId?: string;
    tournamentId?: string;
  }): { success: boolean; error?: string } => {
    const cleanUsername = userData.username.trim();

    const uVal = validateUsername(cleanUsername);
    if (!uVal.isValid) {
      return { success: false, error: uVal.errors.join('. ') };
    }

    const pVal = validatePassword(userData.password);
    if (!pVal.isValid) {
      return { success: false, error: pVal.errors.join('. ') };
    }

    const exists = users.some(
      (u) => u.username.toLowerCase() === cleanUsername.toLowerCase()
    );

    if (exists) {
      return { success: false, error: 'El nombre de usuario ya está registrado en ATOSPORT.' };
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      username: cleanUsername,
      password: userData.password,
      displayName: userData.displayName.trim() || cleanUsername,
      role: userData.role,
      teamId: userData.teamId,
      tournamentId: userData.tournamentId,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);

    return { success: true };
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  // Role Permissions Helpers
  const isMaster = () => currentUser?.role === 'MASTER';
  const isReferee = () => currentUser?.role === 'ARBITRO';
  const isCaptain = () => currentUser?.role === 'REPRESENTANTE';
  const isPlayer = () => currentUser?.role === 'JUGADOR';

  const canManageTournaments = () => {
    return isMaster() || currentUser?.role === 'ADMIN_LIGA';
  };

  const canManageTeams = () => {
    return isMaster() || currentUser?.role === 'ADMIN_LIGA';
  };

  const canManageRoster = (teamId?: string) => {
    if (isMaster() || currentUser?.role === 'ADMIN_LIGA') return true;
    if (currentUser?.role === 'REPRESENTANTE') {
      if (!teamId || !currentUser.teamId) return true;
      return currentUser.teamId === teamId;
    }
    return false;
  };

  const canEditScores = () => {
    return isMaster() || currentUser?.role === 'ADMIN_LIGA' || currentUser?.role === 'ARBITRO';
  };

  const canManageRules = () => {
    return isMaster() || currentUser?.role === 'ADMIN_LIGA';
  };

  const canManageSchedules = () => {
    return isMaster() || currentUser?.role === 'ADMIN_LIGA';
  };

  const isReadOnly = () => {
    return currentUser?.role === 'JUGADOR';
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        register,
        switchUser,
        canManageTournaments,
        canManageTeams,
        canManageRoster,
        canEditScores,
        canManageRules,
        canManageSchedules,
        isReadOnly,
        isMaster,
        isReferee,
        isCaptain,
        isPlayer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
