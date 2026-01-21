#!/bin/bash

# 🚀 Quick Build Script for Keystone Mobile App
# Автоматическая сборка APK с Firebase интеграцией

set -e

echo "🚀 Keystone Mobile App - Quick Build Script"
echo "============================================"
echo ""

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Установите Node.js 18+ с https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js версия: $(node -v)"
echo ""

# Проверка npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не установлен"
    exit 1
fi

echo "✅ npm версия: $(npm -v)"
echo ""

# Проверка Firebase конфигурации
if [ ! -f "firebase/google-services.json" ]; then
    echo "❌ firebase/google-services.json не найден!"
    exit 1
fi

echo "✅ Firebase конфигурация найдена"
echo ""

# Проверка .env файла
if [ ! -f ".env" ]; then
    echo "⚠️  .env файл не найден. Создаю из .env.example..."
    cp .env.example .env
    echo "⚠️  Пожалуйста, обновите .env файл с вашими настройками!"
fi

echo "✅ .env файл найден"
echo ""

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm install

echo ""
echo "✅ Зависимости установлены"
echo ""

# Проверка EAS CLI
if ! command -v eas &> /dev/null; then
    echo "📦 Установка EAS CLI..."
    npm install -g eas-cli
    echo "✅ EAS CLI установлен"
else
    echo "✅ EAS CLI уже установлен"
fi

echo ""

# Проверка авторизации в Expo
echo "🔑 Проверка авторизации в Expo..."
if eas whoami &> /dev/null; then
    echo "✅ Вы авторизованы как: $(eas whoami)"
else
    echo "⚠️  Вы не авторизованы в Expo"
    echo "Запуск авторизации..."
    eas login
fi

echo ""

# Проверка EAS проекта
if grep -q '"projectId": "your-eas-project-id"' app.json; then
    echo "⚠️  EAS проект не настроен"
    echo "Запуск настройки..."
    eas build:configure
else
    echo "✅ EAS проект уже настроен"
fi

echo ""
echo "============================================"
echo "🎯 Готов к сборке!"
echo "============================================"
echo ""
echo "Выберите тип сборки:"
echo ""
echo "1. Preview APK (для тестирования)"
echo "2. Production APK (финальная версия)"
echo "3. Отмена"
echo ""
read -p "Ваш выбор (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🔨 Запуск сборки Preview APK..."
        echo "Это займёт 10-20 минут..."
        eas build --platform android --profile preview
        ;;
    2)
        echo ""
        echo "🔨 Запуск сборки Production APK..."
        echo "Это займёт 10-20 минут..."
        eas build --platform android --profile production
        ;;
    3)
        echo "Отменено"
        exit 0
        ;;
    *)
        echo "❌ Неверный выбор"
        exit 1
        ;;
esac

echo ""
echo "============================================"
echo "✅ Сборка запущена!"
echo "============================================"
echo ""
echo "Отслеживать прогресс можно:"
echo "- В терминале (текущее окно)"
echo "- На сайте: https://expo.dev"
echo ""
echo "После завершения вы получите ссылку на скачивание APK"
echo ""
echo "Просмотреть все сборки:"
echo "  eas build:list"
echo ""
