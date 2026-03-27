import { toast } from 'sonner';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

class NotificationService {
  private hasPermission = false;

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.checkPermission();
    }
  }

  private async checkPermission() {
    if (Notification.permission === 'granted') {
      this.hasPermission = true;
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
    }
  }

  notify(title: string, message: string, type: NotificationType = 'info') {
    // In-app notification (Sonner)
    switch (type) {
      case 'success':
        toast.success(title, { description: message });
        break;
      case 'error':
        toast.error(title, { description: message });
        break;
      case 'warning':
        toast.warning(title, { description: message });
        break;
      default:
        toast.info(title, { description: message });
    }

    // Browser notification
    if (this.hasPermission && document.hidden) {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico', // Update with actual icon path if available
      });
    }
  }

  // Specific helpers
  notifyDocumentGenerated(docType: string) {
    this.notify(
      'Hujjat tayyor!',
      `${docType} muvaffaqiyatli yaratildi va yuklab olishga tayyor.`,
      'success'
    );
  }

  notifyPlanUpgraded(planName: string) {
    this.notify(
      'Reja yangilandi!',
      `Sizning hisobingiz muvaffaqiyatli ${planName} rejasiga o'tkazildi.`,
      'success'
    );
  }

  notifySystemMessage(message: string) {
    this.notify('Tizim xabari', message, 'info');
  }

  notifyNewFeature(featureName: string, description: string) {
    this.notify('Yangi imkoniyat!', `${featureName}: ${description}`, 'info');
  }

  notifyError(message: string) {
    this.notify('Xatolik', message, 'error');
  }
}

export const notificationService = new NotificationService();
