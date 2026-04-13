import { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext(null);

const ROLES = {
  STORE_STAFF: 'store_staff',
  KITCHEN_STAFF: 'kitchen_staff',
  SUPPLY_COORDINATOR: 'supply_coordinator',
  MANAGER: 'manager',
  ADMIN: 'admin',
};

const ROLE_INFO = {
  [ROLES.STORE_STAFF]: {
    label: 'Nhân viên cửa hàng',
    path: '/store',
    color: 'primary',
    description: 'Quản lý đơn hàng và tồn kho cửa hàng',
  },
  [ROLES.KITCHEN_STAFF]: {
    label: 'Nhân viên bếp trung tâm',
    path: '/kitchen',
    color: 'accent',
    description: 'Xử lý sản xuất và xuất kho',
  },
  [ROLES.SUPPLY_COORDINATOR]: {
    label: 'Điều phối cung ứng',
    path: '/supply',
    color: 'warning',
    description: 'Tổng hợp và điều phối đơn hàng',
  },
  [ROLES.MANAGER]: {
    label: 'Quản lý vận hành',
    path: '/manager',
    color: 'info',
    description: 'Giám sát hiệu suất toàn chuỗi',
  },
  [ROLES.ADMIN]: {
    label: 'Quản trị hệ thống',
    path: '/admin',
    color: 'neutral',
    description: 'Quản lý người dùng và cấu hình',
  },
};

const MOCK_USERS = {
  [ROLES.STORE_STAFF]: {
    id: 'u1',
    name: 'Nguyễn Văn An',
    email: 'an.nv@ckitchen.vn',
    role: ROLES.STORE_STAFF,
    store: 'CH001',
    avatar: null,
  },
  [ROLES.KITCHEN_STAFF]: {
    id: 'u2',
    name: 'Trần Thị Bình',
    email: 'binh.tt@ckitchen.vn',
    role: ROLES.KITCHEN_STAFF,
    avatar: null,
  },
  [ROLES.SUPPLY_COORDINATOR]: {
    id: 'u3',
    name: 'Lê Minh Châu',
    email: 'chau.lm@ckitchen.vn',
    role: ROLES.SUPPLY_COORDINATOR,
    avatar: null,
  },
  [ROLES.MANAGER]: {
    id: 'u4',
    name: 'Phạm Quốc Đạt',
    email: 'dat.pq@ckitchen.vn',
    role: ROLES.MANAGER,
    avatar: null,
  },
  [ROLES.ADMIN]: {
    id: 'u5',
    name: 'Hoàng Thùy Dung',
    email: 'dung.ht@ckitchen.vn',
    role: ROLES.ADMIN,
    avatar: null,
  },
};

const initialState = {
  user: null,
  isAuthenticated: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        user: action.payload,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return { ...initialState };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState, () => {
    try {
      const saved = localStorage.getItem('ckitchen_auth');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { user: parsed, isAuthenticated: true };
      }
    } catch { /* ignore */ }
    return initialState;
  });

  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      localStorage.setItem('ckitchen_auth', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('ckitchen_auth');
    }
  }, [state]);

  const login = (role) => {
    const user = MOCK_USERS[role];
    if (user) {
      dispatch({ type: 'LOGIN', payload: user });
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, ROLES, ROLE_INFO, MOCK_USERS }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { ROLES, ROLE_INFO };
