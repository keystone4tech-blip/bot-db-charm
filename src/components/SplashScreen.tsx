import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTelegram } from '@/hooks/useTelegram';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';

interface SplashScreenProps {
  onFinish: () => void;
}

// Массив мотивационных сообщений
const MOTIVATIONAL_MESSAGES = [
  "Добро пожаловать в будущее!",
  "Каждый шаг приближает к успеху",
  "Великие дела начинаются с малого",
  "Верь в себя и свои возможности",
  "Лучшее еще впереди",
  "Ты способен на большее, чем думаешь",
  "Не бойся мечтать по-крупному",
  "Успех — это путешествие, а не пункт назначения",
  "Ты уже на правильном пути",
  "Каждый день — это новая возможность",
  "Твои усилия обязательно принесут плоды",
  "Сегодня ты делаешь шаг к своей мечте",
  "Ты сильнее своих страхов",
  "Все возможно, если ты действительно хочешь",
  "Ты уже преодолел половину пути",
  "Твоя решимость вдохновляет",
  "Ты уникален и обладаешь невероятным потенциалом",
  "Каждый опыт делает тебя сильнее",
  "Ты достоин великих свершений",
  "Твоя вера в себя — твоя сила",
  "Ты создаешь свою реальность",
];

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');

  const { user, isReady } = useTelegram();
  const { isAuthenticated, isLoading: isAuthLoading, error: authError, profile: authProfile } = useTelegramAuth();

  // Функция завершения сплеш-экрана
  const finalizeSplash = useCallback(() => {
    setIsLoading(false);
    setAnimationComplete(true);
    onFinish();
  }, [onFinish]);

  // ОТДЕЛЬНЫЙ useEffect для инициализации (прогресс, сообщения, таймеры)
  // Этот effect работает только при монтировании - пустой массив зависимостей
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let minDisplayTimer: NodeJS.Timeout;
    let messageInterval: NodeJS.Timeout;
    let isMinDisplayTimeCompleted = false;
    let authCompleted = false;

    // Устанавливаем минимальное время отображения 3 секунды
    minDisplayTimer = setTimeout(() => {
      isMinDisplayTimeCompleted = true;
    }, 3000);

    // Прогресс загрузки
    progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return Math.min(100, prev + 2.5);
      });
    }, 100);

    // Смена мотивационных сообщений
    messageInterval = setInterval(() => {
      if (MOTIVATIONAL_MESSAGES.length > 0) {
        const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
        setCurrentMessage(MOTIVATIONAL_MESSAGES[randomIndex]);
      }
    }, 5000);

    // Показываем первое сообщение
    if (MOTIVATIONAL_MESSAGES.length > 0) {
      const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
      setCurrentMessage(MOTIVATIONAL_MESSAGES[randomIndex]);
    }

    // Проверяем готовность аутентификации и завершаем если всё готово
    const checkAuthCompletion = () => {
      if (!isAuthLoading && (authError || isAuthenticated)) {
        authCompleted = true;
        if (isMinDisplayTimeCompleted) {
          finalizeSplash();
        }
      }
    };

    // Периодическая проверка
    const authCheckTimer = setInterval(checkAuthCompletion, 100);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearTimeout(minDisplayTimer);
      clearInterval(authCheckTimer);
    };
  }, []); // ПУСТОЙ МАССИВ - эффект выполняется только при монтировании

  // ОТДЕЛЬНЫЙ useEffect для проверки аутентификации
  useEffect(() => {
    // Проверяем если аутентификация завершена
    if (!isAuthLoading && (authError || (isAuthenticated && authProfile))) {
      // Даём небольшое время на завершение анимации
      const timer = setTimeout(() => {
        finalizeSplash();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isAuthLoading, isAuthenticated, authError, authProfile, finalizeSplash]);

  // Анимация холста
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || animationComplete) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Устанавливаем размеры холста
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Конфигурация
    const maxConnectionDistance = 320;
    const minConnectionDistance = 60;
    const connectionFadeSpeed = 0.08;

    // Нейроны
    const neurons = Array.from({length: 15}, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 200 - 100,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      vz: (Math.random() - 0.5) * 0.15,
    }));

    // Динамический массив связей
    let connections: any[] = [];

    // 3D проекция
    function project(point: any) {
      const perspective = 800;
      const scale = perspective / (perspective + point.z);
      return {
        x: point.x * scale + canvas.width / 2 - canvas.width / 2 * scale,
        y: point.y * scale + canvas.height / 2 - canvas.height / 2 * scale,
        scale: scale,
        rawX: point.x,
        rawY: point.y
      };
    }

    let animationFrameId: number;

    function drawNeural() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 3D движение
      neurons.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;
        if(n.x < 30 || n.x > canvas.width - 30) n.vx *= -1;
        if(n.y < 30 || n.y > canvas.height - 30) n.vy *= -1;
        if(Math.abs(n.z) > 100) n.vz *= -1;
      });

      // Управление связями
      connections = connections.filter(conn => {
        const dist = Math.hypot(conn.from.x - conn.to.x, conn.from.y - conn.to.y);

        if(dist > maxConnectionDistance) {
          conn.fadeAlpha -= connectionFadeSpeed;
          return conn.fadeAlpha > 0;
        }
        conn.fadeAlpha = Math.min(conn.fadeAlpha + connectionFadeSpeed, 1);
        return true;
      });

      neurons.forEach((n, i) => {
        neurons.slice(i + 1).forEach(target => {
          const dist = Math.hypot(n.x - target.x, n.y - target.y);

          const exists = connections.some((c: any) =>
            (c.from === n && c.to === target) || (c.from === target && c.to === n)
          );

          if(dist < maxConnectionDistance && dist > minConnectionDistance && !exists) {
            connections.push({
              from: n,
              to: target,
              progress: Math.random(),
              speed: Math.random() * 0.006 + 0.003,
              pulsePhase: Math.random() * Math.PI * 2,
              pulseSpeed: Math.random() * 0.0015 + 0.0008,
              fadeAlpha: 0
            });
          }
        });
      });

      // Отрисовка связей
      connections.forEach(conn => {
        conn.progress += conn.speed;
        if(conn.progress > 1) conn.progress = 0;

        const fromProj = project(conn.from);
        const toProj = project(conn.to);

        ctx.strokeStyle = `hsla(45, 93%, 47%, ${0.2 * conn.fadeAlpha})`;
        ctx.lineWidth = 1.5 * fromProj.scale;
        ctx.globalAlpha = 0.35 * conn.fadeAlpha;
        ctx.beginPath();
        ctx.moveTo(fromProj.x, fromProj.y);
        ctx.lineTo(toProj.x, toProj.y);
        ctx.stroke();

        // Частицы данных
        const dataPointX = fromProj.x + (toProj.x - fromProj.x) * conn.progress;
        const dataPointY = fromProj.y + (toProj.y - fromProj.y) * conn.progress;

        const pulse = Math.sin(Date.now() * conn.pulseSpeed + conn.pulsePhase) * 0.5 + 0.5;
        const particleSize = 3 * fromProj.scale * (0.5 + pulse * 0.5);

        const gradient = ctx.createRadialGradient(
          dataPointX, dataPointY, 0,
          dataPointX, dataPointY, particleSize
        );
        gradient.addColorStop(0, `hsla(45, 93%, 47%, ${0.8 * conn.fadeAlpha})`);
        gradient.addColorStop(1, `hsla(45, 93%, 47%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(dataPointX, dataPointY, particleSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // Рисуем точки нейронов
      neurons.forEach(neuron => {
        const proj = project(neuron);
        const neuronSize = 3 * proj.scale;

        ctx.beginPath();
        ctx.arc(proj.x, proj.y, neuronSize, 0, Math.PI * 2);

        const neuronGradient = ctx.createRadialGradient(
          proj.x, proj.y, 0,
          proj.x, proj.y, neuronSize * 2
        );
        neuronGradient.addColorStop(0, 'hsla(45, 93%, 47%, 0.9)');
        neuronGradient.addColorStop(1, 'hsla(45, 93%, 47%, 0)');

        ctx.fillStyle = neuronGradient;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(drawNeural);
    }

    animationFrameId = requestAnimationFrame(drawNeural);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [animationComplete]);

  // Обработка подтверждения username
  const handleUsernameSubmit = () => {
    if (!username.trim()) {
      setError('Пожалуйста, введите ваш никнейм');
      return;
    }

    if (username.length < 3) {
      setError('Никнейм должен содержать не менее 3 символов');
      return;
    }

    // Проверка на допустимые символы
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setError('Никнейм может содержать только латинские буквы, цифры и нижнее подчёркивание');
      return;
    }

    setError('');

    // Сохраняем username и завершаем сплеш
    // Username будет сохранён в профиле при следующем обновлении
    finalizeSplash();
  };

  // Если анимация завершена и диалог не показываем - не рендерим ничего
  if (animationComplete && !showUsernameDialog) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background z-50">
      {/* Canvas анимация */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Контент */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Логотип */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg">
            <span className="text-4xl">⚡</span>
          </div>
        </motion.div>

        {/* Заголовок */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-foreground mb-2"
        >
          Keystone
        </motion.h1>

        {/* Прогресс бар */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-xs mb-4"
        >
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-1">
            Загрузка... {Math.round(progress)}%
          </p>
        </motion.div>

        {/* Мотивационное сообщение */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center text-muted-foreground max-w-xs"
          >
            {currentMessage || 'Загрузка...'}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Диалог ввода username */}
      <AnimatePresence>
        {showUsernameDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Установите никнейм</CardTitle>
                  <CardDescription>
                    Для полноценного использования приложения необходимо установить никнейм
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Ваш никнейм</Label>
                      <Input
                        id="username"
                        placeholder="Например: john_doe"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUsernameSubmit()}
                      />
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Никнейм должен содержать от 3 до 20 символов и может включать только латинские буквы, цифры и нижнее подчёркивание
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleUsernameSubmit} className="w-full">
                    Продолжить
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SplashScreen;
