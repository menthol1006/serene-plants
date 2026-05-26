import { User } from '../types/user';

const STORAGE_KEYS = { USER: 'serene_user' };
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '931006';

type AuthStateCallback = (user: User) => void;

const guestUser: User = { uid: 'guest', isAnonymous: true, email: null };
const adminUser: User = { uid: 'local_admin', email: 'admin@local', isAnonymous: false };

let authStateCallbacks: AuthStateCallback[] = [];

const getStoredUser = (): User => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (stored) return JSON.parse(stored) as User;
  } catch (error) {
    console.error('Failed to read stored user:', error);
  }

  return guestUser;
};

let currentUser = getStoredUser();

const persistAndNotify = (user: User) => {
  currentUser = user;
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  authStateCallbacks.forEach((callback) => callback(currentUser));
};

export const auth = {
  get currentUser() {
    return currentUser;
  },

  onAuthStateChanged(callback: AuthStateCallback) {
    authStateCallbacks.push(callback);
    window.setTimeout(() => callback(currentUser), 50);

    return () => {
      authStateCallbacks = authStateCallbacks.filter((item) => item !== callback);
    };
  },
};

export const loginWithPassword = async (password: string) => {
  if (password !== ADMIN_PASSWORD) {
    throw new Error('Invalid password');
  }

  persistAndNotify(adminUser);
  return { user: adminUser };
};

export const loginAnonymously = async () => {
  persistAndNotify(guestUser);
  return { user: guestUser };
};

export const logout = async () => {
  persistAndNotify(guestUser);
};
