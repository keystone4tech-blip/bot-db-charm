import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, AlertTriangle } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  title?: string;
  showDetails?: boolean;
}

const ErrorDisplay = ({ error, title = 'Ошибка', showDetails = true }: ErrorDisplayProps) => {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="whitespace-pre-wrap break-words">
        {error}
        {showDetails && (
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Подробности ошибки
            </summary>
            <div className="text-xs mt-2 p-2 bg-muted rounded">
              Время: {new Date().toLocaleString('ru-RU')}
            </div>
          </details>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorDisplay;