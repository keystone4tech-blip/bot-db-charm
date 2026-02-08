import { useNavigate } from 'react-router-dom';
import { MainAuth } from '@/components/Auth/MainAuth';

export const AuthPage = () => {
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    navigate('/', { replace: true });
  };

  return <MainAuth onAuthSuccess={handleAuthSuccess} />;
};
