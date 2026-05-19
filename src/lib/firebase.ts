const STORAGE_KEYS = { USER: 'serene_user' };
const ADMIN_PASSWORD = '931006';
let authStateCallbacks = [];

const guestUser = { uid: 'guest', isAnonymous: true, email: null };
const adminUser = { uid: 'local_user', email: 'local@user.com', isAnonymous: false };

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('读取用户失败:', e);
  }
  return guestUser;
};

let currentUser = getStoredUser();

const notifyAuthStateChange = () => {
  authStateCallbacks.forEach(cb => cb(currentUser));
};

export const fireAuth = {
  currentUser: currentUser,
  onAuthStateChanged: (callback) => {
    authStateCallbacks.push(callback);
    setTimeout(() => callback(currentUser), 50);
    return () => {
      authStateCallbacks = authStateCallbacks.filter(cb => cb !== callback);
    };
  },
  signInAnonymously: async () => {
    currentUser = guestUser;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(guestUser));
    notifyAuthStateChange();
    return { user: guestUser };
  },
  signOut: async () => {
    currentUser = guestUser;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(guestUser));
    notifyAuthStateChange();
  }
};

export const auth = fireAuth;
export const googleProvider = {};

export const loginWithPassword = async (password) => {
  if (password === ADMIN_PASSWORD) {
    currentUser = adminUser;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(adminUser));
    notifyAuthStateChange();
    return { user: adminUser };
  }
  throw new Error('密码错误');
};

export const loginWithGoogle = async () => {
  throw new Error('请使用密码登录');
};

export const loginAnonymously = async () => {
  return await fireAuth.signInAnonymously();
};

export const logout = async () => {
  await fireAuth.signOut();
};
