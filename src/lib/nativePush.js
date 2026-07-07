// Native push integration (Capacitor)
// This module attempts to register the device with the native push plugin
// and forwards the FCM token to the server via registerDeviceToken.

import { registerDeviceToken } from './pushClient.js';

const CAPACITOR_PUSH_IMPORT = '@capacitor/push-notifications';

async function loadCapacitorPushNotifications() {
  try {
    const runtimeImport = new Function('specifier', 'return import(specifier);');
    const mod = await runtimeImport(CAPACITOR_PUSH_IMPORT);
    return mod?.PushNotifications || null;
  } catch {
    return null;
  }
}

async function initNativePush({ email = '', role = '' } = {}) {
  if (typeof window === 'undefined') return { ok: false, reason: 'no-window' };

  try {
    // Detect Capacitor runtime
    const isCapacitor = !!(window.Capacitor && typeof window.Capacitor.getPlatform === 'function');
    if (!isCapacitor) return { ok: false, reason: 'not-native' };

    // Runtime-only import: avoid Vite pre-resolving the module when not installed.
    // Use a safe try/catch and bail if the module isn't available at runtime.
    let PushNotifications = null;
    try {
      PushNotifications = await loadCapacitorPushNotifications();
      if (!PushNotifications) return { ok: false, reason: 'push-plugin-missing' };
    } catch (ie) {
      // Import failed at runtime — provide diagnostic and a DEV-only simulation fallback.
      try {
        console.warn('[nativePush] Capacitor push plugin import failed:', ie && ie.message ? ie.message : ie);
      } catch (logErr) {
        // ignore logging failures
      }

      // In development, allow simulation via localStorage flag `edusafe_simulate_push`.
      try {
        const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
        const storageAvailable = typeof window !== 'undefined' && window.localStorage;
        const simulateFlag = storageAvailable ? localStorage.getItem('edusafe_simulate_push') : null;
        if (isDev && simulateFlag === '1') {
          try {
            const fakeToken = `dev-sim-${Date.now()}`;
            await registerDeviceToken({ token: fakeToken, email, role });
            console.info('[nativePush] Simulated device token registered (dev).');
            return { ok: true, simulated: true, token: fakeToken };
          } catch (simErr) {
            return { ok: false, reason: 'simulate-failed', error: String(simErr) };
          }
        }
      } catch (e2) {
        // ignore simulation errors
      }

      return { ok: false, reason: 'import-failed', error: String(ie) };
    }

    const perm = await PushNotifications.requestPermissions();
    if (perm.receive !== 'granted') return { ok: false, reason: 'permission-denied' };

    await PushNotifications.register();

    // Listen for registration and forward the token to server
    PushNotifications.addListener('registration', async (token) => {
      try {
        await registerDeviceToken({ token: token.value, email, role });
      } catch (e) {
        // ignore
      }
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('Push registration error', err);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      // handle incoming notification while app is foreground
      console.log('Push received', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      // user tapped a notification
      console.log('Push action', action);
    });

    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export { initNativePush };

// Developer helper: manually simulate push registration from console or tests.
async function simulatePushForDev({ email = '', role = '' } = {}) {
  if (typeof window === 'undefined' || !window.localStorage) return { ok: false, reason: 'no-window' };
  try {
    const token = `dev-sim-${Date.now()}`;
    await registerDeviceToken({ token, email, role });
    return { ok: true, simulated: true, token };
  } catch (e) {
    return { ok: false, reason: 'simulate-failed', error: String(e) };
  }
}

export { simulatePushForDev };
