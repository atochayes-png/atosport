import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  UserRole, 
  INITIAL_USERS, 
  MASTER_USER,
  isReservedMasterUsername,
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
  // Load users from localStorage with immutable Master root enforcement
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filtramos cualquier copia modificada o intento de sobreescritura de Master
          const otherUsers = parsed.filter(
            (u: User) => u.id !== 'u-master' && !isReservedMasterUsername(u.username || '')
          );
          return [MASTER_USER, ...otherUsers];
        }
      }
    } catch (e) {
      console.warn('Error loading users from localStorage:', e);
    }
    return INITIAL_USERS;
  });

  // Load current user from localStorage (default to null for public visitor mode)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          // Si la sesión guardada corresponde a Master, blindamos las credenciales oficiales
          if (parsed.id === 'u-master' || isReservedMasterUsername(parsed.username || '') || parsed.role === 'MASTER') {
            return MASTER_USER;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error loading current user from localStorage:', e);
    }
    // Sesión inicial por defecto: null (Modo Visitante / Público)
    return null;
  });

  // Sync users with localStorage
  useEffect(() => {
    try {
      // Nos aseguramos de que MASTER_USER siempre esté en la lista persistida
      const sanitized = [MASTER_USER, ...users.filter(u => u.id !== 'u-master' && !isReservedMasterUsername(u.username || ''))];
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(sanitized));
    } catch (e) {
      console.error('Error saving users to localStorage:', e);
    }
  }, [users]);

  // Sync current user with localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        const toSave = currentUser.role === 'MASTER' ? MASTER_USER : currentUser;
        localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(toSave));
      } else {
        localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error('Error saving current user to localStorage:', e);
    }
  }, [currentUser]);

  const login = (usernameInput: string, passwordInput: string): { success: boolean; error?: string } => {
    const cleanUsername = usernameInput.trim();

    // 1. Acceso Exclusivo e Inmutable para la Cuenta Raíz Master / Master1
    if (isReservedMasterUsername(cleanUsername)) {
      if (passwordInput === 'Master1') {
        setCurrentUser(MASTER_USER);
        try {
          localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(MASTER_USER));
        } catch (e) {
          console.error('Error saving master session:', e);
        }
        return { success: true };
      } else {
        return { success: false, error: 'Contraseña incorrecta para la cuenta Master.' };
      }
    }

    // Validate requirements for other users
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

    // Candado estricto de registro: Queda prohibido registrar el usuario 'Master'
    if (isReservedMasterUsername(cleanUsername)) {
      return {
        success: false,
        error: 'El nombre de usuario "Master" está blindado y reservado exclusivamente para la cuenta fundadora de ATOSPORT.',
      };
    }

    // Candado estricto de rol: Queda prohibido asignarse el rol 'MASTER'
    if (userData.role === 'MASTER') {
      return {
        success: false,
        error: 'El rol MASTER es una facultad reservada e inmutable de la cuenta fundadora. No puede ser asignado en registros públicos.',
      };
    }

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
    if (userId === 'u-master') {
      setCurrentUser(MASTER_USER);
      return;
    }
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  // Role Permissions Helpers (MASTER cuenta con bypass total sin excepción)
  const isMaster = () => currentUser?.role === 'MASTER';
  const isReferee = () => currentUser?.role === 'ARBITRO';
  const isCaptain = () => currentUser?.role === 'REPRESENTANTE';
  const isPlayer = () => !isMaster() && currentUser?.role === 'JUGADOR';

  const canManageTournaments = () => {
    return isMaster();
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
    return isMaster();
  };

  const canManageSchedules = () => {
    return isMaster() || currentUser?.role === 'ADMIN_LIGA';
  };

  const isReadOnly = () => {
    if (isMaster()) return false;
    return !currentUser || currentUser?.role === 'JUGADOR';
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
