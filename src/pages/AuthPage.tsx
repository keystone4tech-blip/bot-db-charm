import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainAuth } from '@/components/Auth/MainAuth';

export const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref') || undefined;

  const handleAuthSuccess = () => {
    navigate('/', { replace: true });
  };

  return <MainAuth onAuthSuccess={handleAuthSuccess} referralCode={referralCode} />;
};
