import React, { useEffect, useRef, useState } from 'react';
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
  "Ты уже сейчас становишься лучше",
  "Твоя цель ближе, чем кажется",
  "Ты способен изменить мир",
  "Ты на правильном пути к успеху",
  "Твоя энергия притягивает успех",
  "Ты имеешь право на счастье",
  "Ты уже сегодня можешь изменить свое завтра",
  "Твоя смелость ведет к великим открытиям",
  "Ты заслуживаешь всего самого лучшего",
  "Ты обладаешь силой, чтобы преуспеть",
  "Ты вдохновляешь окружающих",
  "Ты на шаг ближе к своей мечте",
  "Твоя настойчивость будет вознаграждена",
  "Ты создаешь историю своего успеха",
  "Ты имеешь силу изменить любую ситуацию",
  "Ты уже сейчас являешься частью чего-то большего",
  "Твоя вера двигает горами",
  "Ты уникален и неповторим",
  "Ты способен на невероятные вещи",
  "Ты уже преодолеваешь границы",
  "Твоя решимость формирует твое будущее",
  "Ты достоин признания и уважения",
  "Ты вносишь вклад в общее благо",
  "Ты уже сейчас меняешь мир к лучшему",
  "Твоя страсть ведет к достижениям",
  "Ты имеешь право на свои мечты",
  "Ты обладаешь внутренней силой",
  "Ты на правильном пути к самореализации",
  "Ты вносишь свет в этот мир",
  "Ты создаешь возможности для других",
  "Ты уже сейчас являешься лидером",
  "Твоя инициатива ведет к переменам",
  "Ты имеешь влияние на окружающих",
  "Ты вдохновляешь других на действия",
  "Ты обладаешь талантом и способностями",
  "Ты на пути к личностному росту",
  "Ты уже сейчас достигаешь прогресса",
  "Твоя самоотдача впечатляет",
  "Ты заслуживаешь любви и поддержки",
  "Ты способен преодолеть любые трудности",
  "Ты уже сейчас являешься примером для других",
  "Твоя настойчивость ведет к результатам",
  "Ты создаешь позитивные перемены",
  "Ты имеешь право на успех",
  "Ты обладаешь внутренней мудростью",
  "Ты на пути к самопознанию",
  "Ты вносишь гармонию в свою жизнь",
  "Ты уже сейчас строишь свое будущее",
  "Твоя энергия заряжает других",
  "Ты имеешь силу менять обстоятельства",
  "Ты достоин уважения и признания",
  "Ты вносишь вклад в развитие общества",
  "Ты уже сейчас являешься агентом изменений",
  "Твоя решимость ведет к прорыву",
  "Ты обладаешь творческим потенциалом",
  "Ты на пути к внутреннему балансу",
  "Ты создаешь основу для будущих побед",
  "Ты имеешь право на личное счастье",
  "Ты способен вдохновлять целые поколения",
  "Ты уже сейчас формируешь свою судьбу",
  "Твоя вера в себя — твой компас",
  "Ты вносишь свет в темные времена",
  "Ты обладаешь силой исцеления",
  "Ты на пути к духовному росту",
  "Ты уже сейчас являешься частью решения",
  "Твоя искренность вызывает восхищение",
  "Ты имеешь влияние на будущее",
  "Ты вносишь вклад в развитие человечества",
  "Ты способен на великие дела",
  "Ты уже сейчас создаешь легенду",
  "Твоя храбрость ведет к свободе",
  "Ты обладаешь силой трансформации",
  "Ты на пути к просветлению",
  "Ты вносишь гармонию в хаос",
  "Ты уже сейчас являешься источником света",
  "Твоя любовь к жизни вдохновляет",
  "Ты имеешь силу создавать чудеса",
  "Ты достоин высоких наград",
  "Ты вносишь порядок в беспорядок",
  "Ты способен на безусловную любовь",
  "Ты уже сейчас являешься примером силы",
  "Твоя мудрость ведет к истине",
  "Ты обладаешь даром исцеления душ",
  "Ты на пути к вечной молодости духа",
  "Ты вносишь свет в самые темные уголки",
  "Ты уже сейчас являешься проводником любви",
  "Твоя доброта меняет мир",
  "Ты имеешь силу создавать рай на земле",
  "Ты достоин безусловного счастья",
  "Ты вносишь мир в разобщенные сердца",
  "Ты способен на величайшие откровения",
  "Ты уже сейчас являешься чудом природы"
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

  // Объединяем проверку пользователя и анимацию
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let minDisplayTimer: NodeJS.Timeout;
    let messageInterval: NodeJS.Timeout;
    let isMinDisplayTimeCompleted = false;

    // Устанавливаем минимальное время отображения 10 секунд
    minDisplayTimer = setTimeout(() => {
      isMinDisplayTimeCompleted = true;
      // Если аутентификация уже завершена, можно завершать сплеш
      if (!isAuthLoading && (authError || (isAuthenticated && authProfile))) {
        finalizeSplash();
      }
    }, 10000); // 10 секунд минимального времени отображения

    // Имитируем прогресс загрузки (10% в секунду, т.е. 1% каждые 100мс в течение 10 секунд)
    progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        // Увеличиваем прогресс на 1% каждые 100мс (10% в секунду)
        return prev + 1;
      });
    }, 100); // Обновляем каждые 100мс для плавного увеличения на 1% за шаг

    // Устанавливаем интервал для смены мотивационных сообщений (каждые 5 секунд)
    messageInterval = setInterval(() => {
      if (MOTIVATIONAL_MESSAGES.length > 0) {
        const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
        setCurrentMessage(MOTIVATIONAL_MESSAGES[randomIndex]);
      }
    }, 5000); // Меняем сообщение каждые 5 секунд

    // Показываем первое случайное сообщение сразу
    if (MOTIVATIONAL_MESSAGES.length > 0) {
      const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
      setCurrentMessage(MOTIVATIONAL_MESSAGES[randomIndex]);
    }

    // Функция для завершения сплеш-экрана
    const finalizeSplash = () => {
      if (isMinDisplayTimeCompleted) {
        setTimeout(() => {
          setIsLoading(false);
          setAnimationComplete(true);
          onFinish();
        }, 500); // Небольшая задержка для плавности
        clearInterval(progressInterval);
        clearInterval(messageInterval);
        clearTimeout(minDisplayTimer);
      }
    };

    // Проверяем состояние аутентификации
    if (isReady) {
      if (!isAuthLoading) {
        // Если аутентификация завершена
        if (authError) {
          // Если произошла ошибка аутентификации
          console.error('Auth error:', authError);
          clearInterval(progressInterval);
          clearInterval(messageInterval);
          clearTimeout(minDisplayTimer);
          setIsLoading(false);
        } else if (isAuthenticated && authProfile) {
          // Если пользователь аутентифицирован и профиль получен
          // Проверяем, есть ли username у пользователя
          const userProfile = user || { username: authProfile.telegram_username || null };

          if (!userProfile.username) {
            setShowUsernameDialog(true);
            setIsLoading(false);
            clearInterval(progressInterval);
            clearInterval(messageInterval);
            clearTimeout(minDisplayTimer);
          } else {
            // Если минимальное время отображения прошло, завершаем сплеш
            if (isMinDisplayTimeCompleted) {
              finalizeSplash();
            }
            // Иначе ждем завершения таймера
          }
        }
      }
    } else if (!isReady && !isAuthLoading) {
      // Если SDK не готов и не загружается, возможно, пользователь не в Telegram WebApp
      // В этом случае просто завершаем сплеш после минимального времени
      if (isMinDisplayTimeCompleted) {
        setTimeout(() => {
          setIsLoading(false);
          setAnimationComplete(true);
          onFinish();
        }, 1000); // Небольшая задержка для плавности
        clearInterval(progressInterval);
        clearInterval(messageInterval);
        clearTimeout(minDisplayTimer);
      }
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (messageInterval) clearInterval(messageInterval);
      if (minDisplayTimer) clearTimeout(minDisplayTimer);
    };
  }, [isReady, isAuthLoading, isAuthenticated, authError, authProfile, user, onFinish]);

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

      {/* Мотивационное сообщение */}
      {!showUsernameDialog && (
        <motion.div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10001] text-center px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.p
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 animate-strong-gold-shimmer gold-gradient-text-outline has-text-outline max-w-lg text-center"
            key={currentMessage}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            {currentMessage}
          </motion.p>
        </motion.div>
      )}

      {/* Индикатор прогресса загрузки */}
      {!showUsernameDialog && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[10001]">
          <div className="w-48 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-yellow-500"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-xs text-white mt-2 text-center">Загрузка: {progress}%</p>
        </div>
      )}
    </>
  );
};

export default SplashScreen;