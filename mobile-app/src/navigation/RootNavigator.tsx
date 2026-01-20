import React from 'react';
import { useAppSelector } from '../redux/hooks';
import { selectIsAuthenticated } from '../redux/slices/authSlice';

import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

export default function RootNavigator() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
}
