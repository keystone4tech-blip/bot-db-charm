import firebase from 'firebase/app';
import 'firebase/messaging';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: firebase.app.App | null = null;

export const setupFirebase = () => {
  try {
    if (!app) {
      app = firebase.initializeApp(firebaseConfig);
      console.log('Firebase initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
};

export const getFirebaseApp = () => {
  return app;
};

export const getMessaging = () => {
  if (!app) {
    throw new Error('Firebase not initialized');
  }
  return firebase.messaging(app);
};
