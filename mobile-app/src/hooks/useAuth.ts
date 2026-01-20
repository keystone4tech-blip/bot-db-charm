import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { selectIsAuthenticated, selectUser, logout } from '../redux/slices/authSlice';
import storage from '../services/storage';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  const handleLogout = async () => {
    dispatch(logout());
    await storage.clear();
  };

  return {
    isAuthenticated,
    user,
    logout: handleLogout,
  };
};
