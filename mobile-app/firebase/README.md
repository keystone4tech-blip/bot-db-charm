# Firebase Configuration

This directory contains Firebase configuration files.

## Required Files

### For Android
- `google-services.json` - Download from Firebase Console → Project Settings → Your Apps → Android

### For iOS
- `GoogleService-Info.plist` - Download from Firebase Console → Project Settings → Your Apps → iOS

## Optional Files

### For Android Signing
- `keystore.jks` - Android signing keystore (for production builds)

### For Google Play Submit
- `service-account.json` - Service account key for Google Play API access

## Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Follow the setup wizard

### 2. Add Android App

1. In Firebase Console: Add app → Android
2. Package name: `com.keystoneapp.mobile`
3. Download `google-services.json`
4. Place it in this directory

### 3. Add iOS App

1. In Firebase Console: Add app → iOS
2. Bundle ID: `com.keystoneapp.mobile`
3. Download `GoogleService-Info.plist`
4. Place it in this directory

### 4. Enable Cloud Messaging

1. In Firebase Console: Cloud Messaging
2. Follow the setup instructions
3. Note down the Server Key and Sender ID

### 5. Add to .env

Copy the values from Firebase Console to your `.env` file:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Security

⚠️ **IMPORTANT**: Never commit these files to Git!

They are already listed in `.gitignore` at the root of the project.

## Troubleshooting

### Android Build Fails

If you get an error about `google-services.json`:

1. Ensure the file exists in this directory
2. Verify it's named correctly (all lowercase, hyphen)
3. Check that `app.json` references the correct path

### iOS Build Fails

If you get an error about `GoogleService-Info.plist`:

1. Ensure the file exists in this directory
2. Verify it's named correctly (case-sensitive)
3. Check that it's added to Xcode project (if using native builds)

### Push Notifications Not Working

1. Verify Cloud Messaging is enabled in Firebase
2. Check that API keys in `.env` match Firebase Console
3. Ensure device permissions are granted
4. Check backend is sending notifications correctly
