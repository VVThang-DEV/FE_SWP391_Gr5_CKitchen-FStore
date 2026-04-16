import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';
import { extractUserFromToken, isTokenExpired } from '../utils/jwt';

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

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...initialState,
        error: action.payload,
      };
    case 'LOGOUT':
      return { ...initialState };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

/**
 * Restore auth state from localStorage
 */
function loadSavedAuth() {
  try {
    const token = localStorage.getItem('ckitchen_token');
    const refreshToken = localStorage.getItem('ckitchen_refresh_token');
    const savedUser = localStorage.getItem('ckitchen_auth');

    if (token && savedUser && !isTokenExpired(token)) {
      const user = JSON.parse(savedUser);
      return {
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    }
  } catch { /* ignore corrupted data */ }

  // Clear stale data
  localStorage.removeItem('ckitchen_token');
  localStorage.removeItem('ckitchen_refresh_token');
  localStorage.removeItem('ckitchen_auth');
  return initialState;
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState, loadSavedAuth);

  // Persist auth state to localStorage
  useEffect(() => {
    if (state.isAuthenticated && state.user && state.token) {
      localStorage.setItem('ckitchen_auth', JSON.stringify(state.user));
      localStorage.setItem('ckitchen_token', state.token);
      if (state.refreshToken) {
        localStorage.setItem('ckitchen_refresh_token', state.refreshToken);
      }
    } else if (!state.isAuthenticated) {
      localStorage.removeItem('ckitchen_auth');
      localStorage.removeItem('ckitchen_token');
      localStorage.removeItem('ckitchen_refresh_token');
    }
  }, [state]);

  /**
   * Login with username and password via BE API
   * @param {string} username
   * @param {string} password
   * @returns {object} user object on success
   * @throws {Error} on failure
   */
  const login = useCallback(async (username, password) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await authApi.login(username, password);

      // BE returns: { statusCode, message, data: { token, refreshToken } }
      const { token, refreshToken } = response.data;

      // Decode JWT to extract user info
      const user = extractUserFromToken(token);

      if (!user) {
        throw new Error('Không thể giải mã thông tin người dùng từ token');
      }

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token, refreshToken },
      });

      return user;
    } catch (err) {
      const message =
        err.status === 401
          ? 'Sai tên đăng nhập hoặc mật khẩu'
          : err.status === 403
          ? 'Tài khoản bị khóa hoặc chưa xác minh'
          : err.message || 'Đăng nhập thất bại. Vui lòng thử lại.';

      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        clearError,
        ROLES,
        ROLE_INFO,
      }}
    >
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
