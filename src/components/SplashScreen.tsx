import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTelegram } from '@/hooks/useTelegram';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [minimumLoadTimeReached, setMinimumLoadTimeReached] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);

  const { user, isReady } = useTelegram();

  // Минимальное время загрузки 10 секунд
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumLoadTimeReached(true);
    }, 10000); // 10 секунд

    return () => clearTimeout(timer);
  }, []);

  // Проверяем пользователя после загрузки Telegram SDK
  useEffect(() => {
    if (isReady && minimumLoadTimeReached && user) {
      // Проверяем, есть ли username у пользователя
      if (!user.username) {
        setShowUsernameDialog(true);
      } else {
        // Если username есть и прошло минимальное время загрузки, завершаем сплеш
        if (minimumLoadTimeReached) {
          setTimeout(() => {
            setAnimationComplete(true);
            onFinish();
          }, 500); // Небольшая задержка для плавности
        }
      }
    }
  }, [isReady, user, minimumLoadTimeReached, onFinish]);

  // Завершаем анимацию только когда прошло минимальное время и пользователь проверен
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

    // Конфигурация - увеличено расстояние
    const maxConnectionDistance = 320; // Увеличено в ~4 раза
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
    let startTime: number | null = null;
    const animationDuration = 3000; // 3 секунды

    function drawNeural(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // Завершаем анимацию через 3 секунды, но не завершаем сплеш, если не прошло минимальное время
      if (elapsed > animationDuration && minimumLoadTimeReached && (!user || user.username)) {
        setAnimationComplete(true);
        if (!showUsernameDialog) {
          onFinish();
        }
        return;
      }

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

      // ДИНАМИЧЕСКОЕ УПРАВЛЕНИЕ СВЯЗЯМИ
      connections = connections.filter(conn => {
        const dist = Math.hypot(conn.from.x - conn.to.x, conn.from.y - conn.to.y);

        if(dist > maxConnectionDistance) {
          conn.fadeAlpha -= connectionFadeSpeed;
          return conn.fadeAlpha > 0; // Удалить если полностью исчезла
        }
        conn.fadeAlpha = Math.min(conn.fadeAlpha + connectionFadeSpeed, 1); // Восстановить
        return true;
      });

      // 2. Создание новых связей на среднем расстоянии
      neurons.forEach((n, i) => {
        neurons.slice(i + 1).forEach(target => {
          const dist = Math.hypot(n.x - target.x, n.y - target.y);

          // Проверить существует ли уже связь
          const exists = connections.some((c: any) =>
            (c.from === n && c.to === target) || (c.from === target && c.to === n)
          );

          // Создать если в зоне среднего расстояния и не существует
          if(dist < maxConnectionDistance && dist > minConnectionDistance && !exists) {
            connections.push({
              from: n,
              to: target,
              progress: Math.random(),
              speed: Math.random() * 0.006 + 0.003,
              pulsePhase: Math.random() * Math.PI * 2,
              pulseSpeed: Math.random() * 0.0015 + 0.0008,
              fadeAlpha: 0 // Начать с нуля (появление)
            });
          }
        });
      });

      // ОТРИСОВКА
      connections.forEach(conn => {
        conn.progress += conn.speed;
        if(conn.progress > 1) conn.progress = 0;

        const fromProj = project(conn.from);
        const toProj = project(conn.to);

        // Используем золотой цвет из темы приложения для линий связи
        ctx.strokeStyle = `hsla(45, 93%, 47%, ${0.2 * conn.fadeAlpha})`;
        ctx.lineWidth = 1.5 * fromProj.scale;
        ctx.globalAlpha = 0.35 * conn.fadeAlpha; // Учет fade
        ctx.beginPath();
        ctx.moveTo(fromProj.x, fromProj.y);
        ctx.lineTo(toProj.x, toProj.y);
        ctx.stroke();

        // Оранжевые частицы данных (золотой цвет из темы приложения)
        const dataPointX = fromProj.x + (toProj.x - fromProj.x) * conn.progress;
        const dataPointY = fromProj.y + (toProj.y - fromProj.y) * conn.progress;

        // Пульсирующий эффект для частицы
        const pulse = Math.sin(Date.now() * conn.pulseSpeed + conn.pulsePhase) * 0.5 + 0.5;
        const particleSize = 3 * fromProj.scale * (0.5 + pulse * 0.5);

        // Оранжевая частица (золотой цвет из темы приложения)
        const gradient = ctx.createRadialGradient(
          dataPointX, dataPointY, 0,
          dataPointX, dataPointY, particleSize
        );
        gradient.addColorStop(0, `hsla(45, 93%, 47%, ${0.8 * conn.fadeAlpha})`); // Золотой цвет из темы
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

        // Центр нейрона
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, neuronSize, 0, Math.PI * 2);

        // Градиент для нейрона (золотой цвет из темы приложения)
        const neuronGradient = ctx.createRadialGradient(
          proj.x, proj.y, 0,
          proj.x, proj.y, neuronSize * 2
        );
        neuronGradient.addColorStop(0, 'hsla(45, 93%, 47%, 0.9)'); // Золотой цвет из темы
        neuronGradient.addColorStop(1, 'hsla(45, 93%, 47%, 0)');

        ctx.fillStyle = neuronGradient;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(drawNeural);
    }

    // Запуск анимации
    animationFrameId = requestAnimationFrame(drawNeural);

    // Очистка при размонтировании
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [animationComplete, minimumLoadTimeReached, user, showUsernameDialog, onFinish]);

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

    if (username.length > 32) {
      setError('Никнейм не должен превышать 32 символа');
      return;
    }

    // Проверяем формат username (только латинские буквы, цифры и подчеркивания)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setError('Никнейм может содержать только латинские буквы, цифры и подчеркивания');
      return;
    }

    setError('');
    setShowUsernameDialog(false);

    // Здесь можно добавить логику сохранения username или направления пользователя к установке в Telegram
    // Пока просто покажем сообщение
    alert(`Пожалуйста, установите никнейм "${username}" в настройках вашего аккаунта Telegram, затем перезапустите приложение.`);
  };

  if (animationComplete && !showUsernameDialog) {
    return null; // Не отображаем ничего после завершения анимации
  }

  return (
    <>
      {/* Фоновое изображение сплеша (опционально) */}
      <div
        className="fixed inset-0 z-[9997] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/splash-bg.jpg')", // Путь к пользовательскому изображению
          backgroundSize: 'cover',
          opacity: 0.3 // Уменьшаем видимость фона, чтобы не мешал анимации
        }}
      />

      <canvas
        ref={canvasRef}
        id="splash-neural-animation"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: showUsernameDialog ? 9998 : 9999, // Диалог должен быть поверх анимации
          opacity: 1
        }}
      />

      {/* Диалог для ввода username */}
      <AnimatePresence>
        {showUsernameDialog && (
          <motion.div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Требуется никнейм в Telegram</CardTitle>
                <CardDescription>
                  Для использования приложения необходимо иметь никнейм в Telegram.
                  Пожалуйста, введите желаемый никнейм, который вы установите в Telegram.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Желаемый никнейм</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Введите никнейм"
                      autoFocus
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Alert>
                    <AlertDescription>
                      После установки никнейма в Telegram, перезапустите это приложение для продолжения.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button
                  className="w-full"
                  onClick={handleUsernameSubmit}
                  disabled={!username.trim()}
                >
                  Продолжить
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // Показываем инструкцию по установке username в Telegram
                    alert('Чтобы установить никнейм в Telegram:\n1. Откройте Telegram\n2. Перейдите в "Настройки"\n3. Нажмите на ваше имя\n4. Выберите "Изменить профиль"\n5. Введите желаемый никнейм в поле "Имя пользователя"');
                  }}
                >
                  Как установить никнейм?
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Индикатор прогресса загрузки */}
      {!showUsernameDialog && minimumLoadTimeReached && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[10001]">
          <div className="w-48 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-yellow-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-white mt-2 text-center">Загрузка завершена</p>
        </div>
      )}
    </>
  );
};

export default SplashScreen;