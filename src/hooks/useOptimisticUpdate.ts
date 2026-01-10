import { useState, useCallback } from 'react';

interface OptimisticUpdateOptions<T> {
  mutationFn: (data: T) => Promise<any>;
  queryKey: string | string[];
  invalidateQueries?: (queryClient: any) => void;
}

export const useOptimisticUpdate = <T,>({
  mutationFn,
  queryKey,
  invalidateQueries
}: OptimisticUpdateOptions<T>) => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (newData: T, queryClient: any) => {
    setIsPending(true);
    setError(null);

    try {
      // Отменяем предыдущие запросы
      await queryClient.cancelQueries(queryKey);
      
      // Сохраняем предыдущее состояние
      const previousData = queryClient.getQueryData(queryKey);
      
      // Оптимистично обновляем UI
      queryClient.setQueryData(queryKey, (old: T) => ({
        ...old,
        ...newData
      }));

      // Выполняем мутацию
      const result = await mutationFn(newData);

      // Если invalidateQueries предоставлена, используем её
      if (invalidateQueries) {
        invalidateQueries(queryClient);
      } else {
        // Иначе инвалидируем конкретный query
        await queryClient.invalidateQueries(queryKey);
      }

      return result;
    } catch (err) {
      // Откатываем изменения при ошибке
      queryClient.setQueryData(queryKey, (old: T) => old);
      
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка';
      setError(errorMessage);
      throw err;
    } finally {
      setIsPending(false);
    }
  }, [mutationFn, queryKey, invalidateQueries]);

  return { mutate, isPending, error };
};