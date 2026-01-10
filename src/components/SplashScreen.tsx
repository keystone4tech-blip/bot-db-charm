import React, { useEffect, useRef, useState } from 'react';

const SplashScreen = ({ onFinish }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
      
      // Завершаем анимацию через 3 секунды
      if (elapsed > animationDuration) {
        setAnimationComplete(true);
        onFinish();
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
  }, [onFinish]);

  if (animationComplete) {
    return null; // Не отображаем ничего после завершения анимации
  }

  return (
    <canvas
      ref={canvasRef}
      id="splash-neural-animation"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        opacity: 1
      }}
    />
  );
};

export default SplashScreen;