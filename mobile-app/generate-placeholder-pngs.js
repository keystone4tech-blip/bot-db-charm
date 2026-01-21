const fs = require('fs');
const path = require('path');

// Минимальные валидные PNG изображения в base64 (одноцветные квадраты)
// Эти изображения можно использовать как плейсхолдеры для тестирования

const imagesDir = path.join(__dirname, 'src', 'assets', 'images');

// Убедимся что папка существует
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Минимальное валидное PNG изображение 1x1 синего цвета
const bluePNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Минимальное валидное PNG изображение 1x1 белого цвета
const whitePNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

// Минимальное валидное PNG изображение 1x1 прозрачного цвета
const transparentPNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=';

// Функция для создания изображения из base64
function createImage(filename, base64Data) {
  const buffer = Buffer.from(base64Data, 'base64');
  const filePath = path.join(imagesDir, filename);
  fs.writeFileSync(filePath, buffer);
  console.log(`✅ Создан: ${filename}`);
}

console.log('🎨 Создание минимальных PNG изображений-плейсхолдеров...');
console.log('');

// Создание всех необходимых изображений
createImage('icon.png', bluePNG);
createImage('adaptive-icon.png', bluePNG);
createImage('splash.png', whitePNG);
createImage('favicon.png', bluePNG);
createImage('notification-icon.png', transparentPNG);

console.log('');
console.log('✅ Все изображения созданы в:', imagesDir);
console.log('');
console.log('⚠️  ВАЖНО: Это минимальные плейсхолдеры (1x1 пиксель)');
console.log('   Они позволят собрать APK для тестирования, но:');
console.log('   - Иконка будет выглядеть как одноцветный квадрат');
console.log('   - Splash screen будет белым экраном');
console.log('');
console.log('📝 Для production сборки замените на реальные изображения:');
console.log('   icon.png - 1024x1024');
console.log('   adaptive-icon.png - 1024x1024');
console.log('   splash.png - 1284x2778');
console.log('   favicon.png - 48x48');
console.log('   notification-icon.png - 96x96');
console.log('');
console.log('🎨 Создать изображения можно на:');
console.log('   - https://www.canva.com/ (онлайн редактор)');
console.log('   - https://www.figma.com/ (дизайн инструмент)');
console.log('   - https://icon.kitchen/ (генератор иконок)');
console.log('');
console.log('📖 Подробнее в файле: ASSETS_REQUIRED.md');
console.log('');
