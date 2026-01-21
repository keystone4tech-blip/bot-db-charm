import firebase from 'firebase/app';
import 'firebase/messaging';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCdcKrKTK2XWUWm9mhwLCr_nf64Z39lny8',
  authDomain: 'keystone-app-95683.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'keystone-app-95683',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'keystone-app-95683.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '786351500985',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:786351500985:android:2b9a625d3c17867a8d7568',
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
