import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable()
export class NotificationsService {
  public async showNotification(title: string, options: NotificationOptions): Promise<void> {
    if (environment.production && navigator.serviceWorker.controller !== undefined) {
      const serviceWorkerRegistration = await navigator.serviceWorker.ready;
      serviceWorkerRegistration.showNotification(title, options);
    } else {
      const notification: Notification = new Notification(title, options);
    }
  }
}
