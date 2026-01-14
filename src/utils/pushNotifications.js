import axiosInstance from '../Components/axiosInstance';

/**
 * Check if push notifications are supported
 * @returns {boolean}
 */
export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Get the VAPID public key from the server
 * @returns {Promise<string>}
 */
export async function getVapidPublicKey() {
  const response = await axiosInstance.get('/push/vapid-public-key');
  return response.data.publicKey;
}

/**
 * Convert a base64 string to a Uint8Array for the applicationServerKey
 * @param {string} base64String
 * @returns {Uint8Array}
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Register the service worker
 * @returns {Promise<ServiceWorkerRegistration>}
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker not supported');
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('Service Worker registered:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    throw error;
  }
}

/**
 * Subscribe to push notifications
 * @returns {Promise<PushSubscription>}
 */
export async function subscribeToPush() {
  if (!isPushSupported()) {
    throw new Error('Push notifications not supported');
  }

  // Request notification permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission denied');
  }

  // Register service worker
  const registration = await registerServiceWorker();

  // Wait for service worker to be ready
  await navigator.serviceWorker.ready;

  // Get the VAPID public key
  const vapidPublicKey = await getVapidPublicKey();

  // Subscribe to push
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  console.log('Push subscription created:', subscription);

  // Send subscription to server
  await axiosInstance.post('/push/subscribe', {
    subscription: subscription.toJSON(),
  });

  console.log('Push subscription saved to server');
  return subscription;
}

/**
 * Unsubscribe from push notifications
 * @returns {Promise<boolean>}
 */
export async function unsubscribeFromPush() {
  if (!isPushSupported()) {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    console.log('No push subscription found');
    return false;
  }

  // Unsubscribe locally
  await subscription.unsubscribe();

  // Remove from server
  await axiosInstance.post('/push/unsubscribe', {
    endpoint: subscription.endpoint,
  });

  console.log('Unsubscribed from push notifications');
  return true;
}

/**
 * Check if user is subscribed to push notifications
 * @returns {Promise<boolean>}
 */
export async function isSubscribedToPush() {
  if (!isPushSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (error) {
    console.error('Error checking push subscription:', error);
    return false;
  }
}

/**
 * Send a test push notification
 * @returns {Promise<Object>}
 */
export async function sendTestPush() {
  const response = await axiosInstance.post('/push/test');
  return response.data;
}
