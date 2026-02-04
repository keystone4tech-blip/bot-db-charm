// src/components/Auth/PasswordStrengthIndicator.tsx
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface StrengthLevel {
  level: number;
  label: string;
  colorClass: string;
  barClass: string;
}

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const strength = useMemo((): StrengthLevel => {
    if (!password) {
      return { level: 0, label: '', colorClass: 'text-muted-foreground', barClass: 'bg-muted' };
    }

    let score = 0;
    
    // Длина пароля
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Содержит цифры
    if (/\d/.test(password)) score += 1;
    
    // Содержит строчные буквы
    if (/[a-z]/.test(password)) score += 1;
    
    // Содержит заглавные буквы
    if (/[A-Z]/.test(password)) score += 1;
    
    // Содержит специальные символы
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    if (score <= 2) {
      return { level: 1, label: 'Слабый', colorClass: 'text-destructive', barClass: 'bg-destructive' };
    } else if (score <= 4) {
      return { level: 2, label: 'Средний', colorClass: 'text-warning', barClass: 'bg-warning' };
    } else if (score <= 5) {
      return { level: 3, label: 'Хороший', colorClass: 'text-primary', barClass: 'bg-primary' };
    } else {
      return { level: 4, label: 'Надёжный', colorClass: 'text-success', barClass: 'bg-success' };
    }
  }, [password]);

  if (!password) {
    return null;
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              index <= strength.level ? strength.barClass : 'bg-muted'
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs transition-colors', strength.colorClass)}>
        Сложность пароля: {strength.label}
      </p>
    </div>
  );
};
