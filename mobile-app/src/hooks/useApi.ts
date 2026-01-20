import { useAppDispatch } from '../redux/hooks';
import { setLoading, setError } from '../redux/slices/authSlice';

export const useApi = () => {
  const dispatch = useAppDispatch();

  const apiCall = async <T,>(
    apiFunction: () => Promise<T>,
    onSuccess?: (data: T) => void,
    onError?: (error: any) => void
  ): Promise<T | null> => {
    try {
      dispatch(setLoading(true));
      const data = await apiFunction();
      if (onSuccess) onSuccess(data);
      return data;
    } catch (error: any) {
      dispatch(setError(error.response?.data?.error || error.message || 'Произошла ошибка'));
      if (onError) onError(error);
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return { apiCall };
};
