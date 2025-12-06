import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

class PushNotificationService {
  constructor() {
    this.initialized = false;
    this.token = null;
    this.listeners = [];
  }

  async init() {
    if (this.initialized) return;
    
    if (!Capacitor.isNativePlatform()) {
      console.log('📱 Push notifications only available on native platforms');
      return;
    }

    try {
      const permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        const newStatus = await PushNotifications.requestPermissions();
        if (newStatus.receive !== 'granted') {
          console.log('❌ Push notification permission denied');
          return;
        }
      } else if (permStatus.receive !== 'granted') {
        console.log('❌ Push notification permission not granted');
        return;
      }

      await PushNotifications.register();
      this.setupListeners();
      this.initialized = true;
      console.log('✅ Push notifications initialized');
    } catch (error) {
      console.error('❌ Error initializing push notifications:', error);
    }
  }

  setupListeners() {
    PushNotifications.addListener('registration', async (token) => {
      console.log('📱 Push registration token:', token.value);
      this.token = token.value;
      await this.saveTokenToServer(token.value);
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('❌ Push registration error:', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('📬 Push notification received:', notification);
      this.notifyListeners('received', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('👆 Push notification action performed:', notification);
      this.notifyListeners('actionPerformed', notification);
    });
  }

  async saveTokenToServer(token) {
    try {
      const platform = Capacitor.getPlatform();
      const response = await fetch('/api/push-notifications/register-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          token,
          platform,
          deviceInfo: {
            platform,
            isNative: Capacitor.isNativePlatform(),
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save push token');
      }

      console.log('✅ Push token saved to server');
    } catch (error) {
      console.error('❌ Error saving push token:', error);
    }
  }

  async removeTokenFromServer() {
    if (!this.token) return;

    try {
      await fetch('/api/push-notifications/unregister-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token: this.token }),
      });
      console.log('✅ Push token removed from server');
    } catch (error) {
      console.error('❌ Error removing push token:', error);
    }
  }

  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in push notification listener:', error);
      }
    });
  }

  getToken() {
    return this.token;
  }

  isSupported() {
    return Capacitor.isNativePlatform();
  }
}

export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
