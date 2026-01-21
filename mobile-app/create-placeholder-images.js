const fs = require('fs');
const path = require('path');

// Простой скрипт для создания SVG изображений, которые можно конвертировать в PNG
// Для полноценной работы требуется ImageMagick или использование онлайн конвертера

const imagesDir = path.join(__dirname, 'src', 'assets', 'images');

// Убедимся что папка существует
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// SVG для иконки (будет конвертировано в PNG)
const iconSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#007AFF" rx="180"/>
  <text x="512" y="700" font-family="Arial" font-size="600" font-weight="bold" fill="white" text-anchor="middle">K</text>
</svg>`;

const splashSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1284" height="2778" viewBox="0 0 1284 2778" xmlns="http://www.w3.org/2000/svg">
  <rect width="1284" height="2778" fill="white"/>
  <circle cx="642" cy="1200" r="150" fill="#007AFF"/>
  <text x="642" y="1230" font-family="Arial" font-size="120" font-weight="bold" fill="white" text-anchor="middle">K</text>
  <text x="642" y="1450" font-family="Arial" font-size="60" fill="#333" text-anchor="middle">Keystone</text>
</svg>`;

const faviconSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" fill="#007AFF" rx="8"/>
  <text x="24" y="36" font-family="Arial" font-size="28" font-weight="bold" fill="white" text-anchor="middle">K</text>
</svg>`;

const notificationSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <text x="48" y="72" font-family="Arial" font-size="60" font-weight="bold" fill="white" text-anchor="middle">K</text>
</svg>`;

// Сохранение SVG файлов
fs.writeFileSync(path.join(imagesDir, 'icon.svg'), iconSVG);
fs.writeFileSync(path.join(imagesDir, 'adaptive-icon.svg'), iconSVG);
fs.writeFileSync(path.join(imagesDir, 'splash.svg'), splashSVG);
fs.writeFileSync(path.join(imagesDir, 'favicon.svg'), faviconSVG);
fs.writeFileSync(path.join(imagesDir, 'notification-icon.svg'), notificationSVG);

console.log('✅ SVG файлы созданы в:', imagesDir);
console.log('');
console.log('📝 СЛЕДУЮЩИЙ ШАГ: Конвертация SVG в PNG');
console.log('');
console.log('Вариант 1: Использовать ImageMagick (если установлен)');
console.log('---------------------------------------------------');
console.log('cd', imagesDir);
console.log('');
console.log('# icon.png');
console.log('magick convert -background none icon.svg -resize 1024x1024 icon.png');
console.log('');
console.log('# adaptive-icon.png');
console.log('magick convert -background none adaptive-icon.svg -resize 1024x1024 adaptive-icon.png');
console.log('');
console.log('# splash.png');
console.log('magick convert splash.svg -resize 1284x2778 splash.png');
console.log('');
console.log('# favicon.png');
console.log('magick convert -background none favicon.svg -resize 48x48 favicon.png');
console.log('');
console.log('# notification-icon.png');
console.log('magick convert -background none notification-icon.svg -resize 96x96 notification-icon.png');
console.log('');
console.log('Вариант 2: Использовать онлайн конвертер');
console.log('------------------------------------------');
console.log('1. Откройте https://cloudconvert.com/svg-to-png');
console.log('2. Загрузите SVG файлы из:', imagesDir);
console.log('3. Конвертируйте в PNG с нужными размерами');
console.log('4. Скачайте и поместите обратно в:', imagesDir);
console.log('');
console.log('Вариант 3: Использовать Inkscape');
console.log('----------------------------------');
console.log('inkscape icon.svg --export-filename=icon.png --export-width=1024 --export-height=1024');
console.log('');
