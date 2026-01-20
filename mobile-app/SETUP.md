# Полная инструкция по настройке Keystone Mobile App

## 📋 Оглавление

1. [Предварительные требования](#предварительные-требования)
2. [Установка зависимостей](#установка-зависимостей)
3. [Настройка Firebase](#настройка-firebase)
4. [Настройка EAS](#настройка-eas)
5. [Настройка переменных окружения](#настройка-переменных-окружения)
6. [Подготовка активов](#подготовка-активов)
7. [Запуск в development режиме](#запуск-в-development-режиме)
8. [Настройка для Android](#настройка-для-android)
9. [Настройка для iOS](#настройка-для-ios)

---

## Предварительные требования

### Обязательные для всех платформ

- **Node.js** 18.0 или выше
  ```bash
  node --version
  ```

- **npm** 9.0 или выше
  ```bash
  npm --version
  ```

- **Git**
  ```bash
  git --version
  ```

- **Expo CLI**
  ```bash
  npm install -g expo-cli
  npm install -g eas-cli
  ```

### Для Android

- **JDK** 11 или выше
- **Android Studio** (с Android SDK)
- **Android SDK** (API 33+)
- **Android Build Tools**
- **Android SDK Platform-Tools**

### Для iOS (только macOS)

- **Xcode** 14.0 или выше
- **CocoaPods**
  ```bash
  sudo gem install cocoapods
  ```
- **Xcode Command Line Tools**
  ```bash
  xcode-select --install
  ```

---

## Установка зависимостей

### 1. Клонируйте репозиторий

```bash
cd /path/to/project
cd mobile-app
```

### 2. Установите npm пакеты

```bash
npm install
```

### 3. Проверьте установку

```bash
npx expo doctor
```

---

## Настройка Firebase

### Шаг 1: Создание проекта в Firebase

1. Перейдите в [Firebase Console](https://console.firebase.google.com/)
2. Нажмите "Add project"
3. Введите имя проекта (например: "keystone-mobile")
4. Следуйте инструкциям мастера

### Шаг 2: Настройка Android

1. В Firebase Console: Project Settings → Add app → Android
2. Введите package name: `com.keystoneapp.mobile`
3. Скачайте `google-services.json`
4. Поместите файл в: `mobile-app/firebase/google-services.json`

### Шаг 3: Настройка iOS

1. В Firebase Console: Project Settings → Add app → iOS
2. Введите bundle ID: `com.keystoneapp.mobile`
3. Скачайте `GoogleService-Info.plist`
4. Поместите файл в: `mobile-app/firebase/GoogleService-Info.plist`

### Шаг 4: Включите Cloud Messaging

1. Firebase Console → Cloud Messaging
2. Следуйте инструкциям для настройки FCM
3. Сохраните Server Key и Sender ID

### Шаг 5: Получите Firebase конфигурацию

Перейдите в Project Settings → General → Your Apps и скопируйте:

- **API Key**
- **Auth Domain**
- **Project ID**
- **Storage Bucket**
- **Messaging Sender ID**
- **App ID**

---

## Настройка EAS (Expo Application Services)

### Шаг 1: Вход в EAS

```bash
eas login
```

Следуйте инструкциям для входа через Expo.

### Шаг 2: Настройка проекта

```bash
eas build:configure
```

Это создаст/обновит файл `eas.json` и свяжет проект с EAS.

### Шаг 3: Получите Project ID

Команда выше выведет EAS Project ID. Сохраните его.

Обновите `app.json`:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-actual-project-id"
      }
    },
    "updates": {
      "url": "https://u.expo.dev/your-actual-project-id"
    }
  }
}
```

---

## Настройка переменных окружения

### Шаг 1: Создайте .env файл

```bash
cp .env.example .env
```

### Шаг 2: Заполните переменные

Откройте `.env` и заполните:

```env
# Backend API
EXPO_PUBLIC_API_BASE_URL=https://your-domain.com/api

# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=keystone-mobile.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=keystone-mobile
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=keystone-mobile.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:android:abcdef
```

### Важно: Не добавляйте .env в Git!

Убедитесь, что `.gitignore` содержит:
```
.env
.firebase/
firebase/google-services.json
firebase/GoogleService-Info.plist
```

---

## Подготовка активов

### Обязательные изображения

Создайте следующие изображения в папке `src/assets/images/`:

1. **icon.png** (1024x1024 px) - Иконка приложения
2. **adaptive-icon.png** (1024x1024 px) - Адаптивная иконка для Android
3. **splash.png** (1284x2778 px) - Экран загрузки
4. **favicon.png** (48x48 px) - Иконка для web
5. **notification-icon.png** (96x96 px) - Иконка для уведомлений

### Гиперссылки для дизайна

Вы можете использовать бесплатные сервисы:
- [Canva](https://www.canva.com/) - Создание иконок
- [Figma](https://www.figma.com/) - Профессиональный дизайн
- [Expo Icon Generator](https://icon.kitchen/) - Генератор иконок

### Шрифты (опционально)

Если хотите использовать свои шрифты:

1. Поместите .ttf файлы в `src/assets/fonts/`
2. Обновите `app.json`:

```json
{
  "expo": {
    "fonts": [
      "./src/assets/fonts/CustomFont-Regular.ttf",
      "./src/assets/fonts/CustomFont-Bold.ttf"
    ]
  }
}
```

---

## Запуск в development режиме

### Запуск Expo dev server

```bash
npm start
```

Или:

```bash
npx expo start
```

### Доступные опции

- `a` - Открыть на Android
- `i` - Открыть на iOS
- `w` - Открыть в браузере
- `r` - Перезапустить bundler
- `d` - Открыть dev tools
- `s` - Отключить/shake устройство

### Запуск на конкретной платформе

```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

---

## Настройка для Android

### Шаг 1: Генерация нативного кода

```bash
npm run prebuild
```

Это создаст папку `android/` с полным нативным проектом.

### Шаг 2: Открытие в Android Studio

```bash
# Linux/macOS
open android/

# Windows
start android/
```

Или откройте папку `android/` через Android Studio.

### Шаг 3: Конфигурация Android

1. Откройте `android/app/build.gradle`
2. Убедитесь, что `versionCode` и `versionName` соответствуют `app.json`
3. Проверьте `applicationId`: `com.keystoneapp.mobile`

### Шаг 4: Настройка signing key (для production)

Создайте keystore:

```bash
keytool -genkeypair -v -keystore keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias keystone
```

Поместите `keystore.jks` в `firebase/` папку.

Обновите `eas.json`:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccount": "./firebase/service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### Шаг 5: Запуск на устройстве/эмуляторе

```bash
# Проверьте подключенные устройства
adb devices

# Запустите приложение
npm run android
```

---

## Настройка для iOS (macOS только)

### Шаг 1: Генерация нативного кода

```bash
npm run prebuild
```

### Шаг 2: Установка CocoaPods зависимостей

```bash
cd ios
pod install
cd ..
```

### Шаг 3: Открытие в Xcode

```bash
open ios/keystoneapp.xcworkspace
```

**Важно**: Открывайте `.xcworkspace`, а не `.xcodeproj`!

### Шаг 4: Настройка provisioning profiles

1. В Xcode: Target → Signing & Capabilities
2. Выберите свою команду
3. Убедитесь, что Bundle Identifier: `com.keystoneapp.mobile`
4. Xcode автоматически настроит provisioning profiles

### Шаг 5: Добавление capabilities

В Xcode → Signing & Capabilities → + Capability:

- **Push Notifications**
- **Background Modes** → Remote notifications
- **In-App Purchase** (если нужно)

### Шаг 6: Запуск на устройстве/симуляторе

```bash
# Симулятор
npm run ios

# Устройство (подключите iPhone)
npm run ios
```

### Шаг 7: Настройка для App Store

1. Product → Scheme → Edit Scheme
2. Build Configuration: Release
3. Build → Archive
4. В Organizer: Distribute App

---

## Проверка конфигурации

### Проверьте Firebase

```bash
# Проверьте google-services.json
cat firebase/google-services.json
```

### Проверьте .env

```bash
# Проверьте переменные
cat .env
```

### Проверьте EAS

```bash
# Проверьте статус
eas build:list --limit=1
```

---

## Решение проблем

### Expo doctor

```bash
npx expo doctor
```

### Очистка кэша

```bash
# Expo кэш
expo r -c

# Node modules
rm -rf node_modules
npm install

# Prebuild
rm -rf android ios
npm run prebuild
```

### Android проблемы

```bash
# Gradle clean
cd android
./gradlew clean
cd ..

# Удалите и пересоберите
adb uninstall com.keystoneapp.mobile
npm run android
```

### iOS проблемы

```bash
# Очистка Xcode
cd ios
pod deintegrate
pod install
cd ..

# Сброс симулятора
xcrun simctl erase all
```

---

## Следующие шаги

1. ✅ Завершите эту инструкцию
2. ✅ Прочитайте [BUILD.md](BUILD.md) для сборки production версий
3. ✅ Запустите приложение и протестируйте

---

## Дополнительные ресурсы

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
