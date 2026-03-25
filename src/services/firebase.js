import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebaseEnabled = !!firebaseConfig.projectId && !!firebaseConfig.apiKey;

let app = null;
let messaging = null;

if (firebaseEnabled) {
  app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
} else {
  console.warn('Firebase config missing — push notifications disabled.');
}

/**
 * Request notification permission and return the FCM token.
 * Returns null if permission denied or browser unsupported.
 */
export async function requestFCMToken() {
  if (!firebaseEnabled || !messaging) return null;

  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications.');
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('Notification permission denied.');
    return null;
  }

  try {
    let swRegistration;
    if ('serviceWorker' in navigator) {
      swRegistration = await navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((reg) => {
          // Wait for the service worker to be active before using it
          if (reg.active) return reg;
          return new Promise((resolve) => {
            const sw = reg.installing || reg.waiting;
            if (!sw) { resolve(reg); return; }
            sw.addEventListener('statechange', function handler() {
              if (sw.state === 'activated') {
                sw.removeEventListener('statechange', handler);
                resolve(reg);
              }
            });
          });
        });
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      ...(swRegistration && { serviceWorkerRegistration: swRegistration }),
    });
    return token || null;
  } catch (err) {
    console.error('Failed to get FCM token:', err);
    return null;
  }
}

/**
 * Listen for foreground messages (app is open and in focus).
 * Calls the provided callback with { title, body, data }.
 */
export function onForegroundMessage(callback) {
  if (!firebaseEnabled || !messaging) return () => {};

  return onMessage(messaging, (payload) => {
    const title = payload.notification?.title || payload.data?.title || 'New Notification';
    const body = payload.notification?.body || payload.data?.message || payload.data?.body || '';
    const data = payload.data || {};
    callback({ title, body, data });
  });
}

export { messaging };
