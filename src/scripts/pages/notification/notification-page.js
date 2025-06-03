import { notificationListTemplate } from '../templates';
import NotificationPresenter from './notification-presenter.js';

export default class NotificationPage {
  constructor() {
    this.presenter = new NotificationPresenter(this);
    this.notifications = [];
  }

  async render() {
    return `
      <section class="lg:p-8 p-6 pt-2 md:p-6">
        <div class="max-w-xl w-full ml-0 md:ml-16 lg:ml-24 text-left">
          <div class="flex justify-between items-center mb-8 mt-3">
            <h1 class="text-2xl font-semibold">Pemberitahuan</h1>
            <button id="mark-all-read-btn" class="text-sm text-third hover:text-third/80 hidden">
              Tandai Semua Dibaca
            </button>
          </div>
          
          <div id="notification-loading" class="text-center py-8">
            <p class="text-gray-500">Memuat notifikasi...</p>
          </div>
          
          <div id="notification-container" class="hidden">
            <!-- Notifications will be rendered here -->
          </div>
          
          <div id="notification-error" class="hidden text-center py-8">
            <p class="text-red-500">Gagal memuat notifikasi</p>
            <button id="retry-btn" class="mt-4 px-4 py-2 bg-third text-white rounded-lg">Coba Lagi</button>
          </div>

          <div id="success-message" class="hidden bg-third/10 border border-third text-third px-4 py-3 rounded mb-4">
          <p></p>
        </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this.presenter.loadNotifications();
    this.attachEventListeners();
  }

  displayNotifications(notifications) {
    this.notifications = notifications;
    const container = document.getElementById('notification-container');
    const loading = document.getElementById('notification-loading');
    const error = document.getElementById('notification-error');
    const markAllReadBtn = document.getElementById('mark-all-read-btn');

    loading.classList.add('hidden');
    error.classList.add('hidden');

    if (notifications.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8">
          <p class="text-gray-500">Belum ada notifikasi</p>
        </div>
      `;
      markAllReadBtn.classList.add('hidden');
    } else {
      container.innerHTML = notificationListTemplate(notifications);

      this.attachNotificationClickListeners();

      const hasUnreadNotifications = notifications.some(n => !n.read);
      if (hasUnreadNotifications) {
        markAllReadBtn.classList.remove('hidden');
      } else {
        markAllReadBtn.classList.add('hidden');
      }
    }

    container.classList.remove('hidden');
  }

  showError(message) {
    const container = document.getElementById('notification-container');
    const loading = document.getElementById('notification-loading');
    const error = document.getElementById('notification-error');
    const errorText = error.querySelector('p');

    loading.classList.add('hidden');
    container.classList.add('hidden');
    errorText.textContent = message;
    error.classList.remove('hidden');
  }

  showSuccessMessage(message) {
    const successDiv = document.getElementById('success-message');
    const messageP = successDiv.querySelector('p');

    messageP.textContent = message;
    successDiv.classList.remove('hidden');

    setTimeout(() => {
      successDiv.classList.add('hidden');
    }, 3000);
  }

  attachEventListeners() {
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.showLoading();
        this.presenter.loadNotifications();
      });
    }

    const markAllBtn = document.getElementById('mark-all-read-btn');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', () => {
        this.handleMarkAllAsRead();
      });
    }
    this.attachNotificationClickListeners();
  }

attachNotificationClickListeners() {
  const notificationItems = document.querySelectorAll('[data-notification-id]');
  notificationItems.forEach(item => {
    item.removeEventListener('click', this.handleNotificationClickBound);
    
    this.handleNotificationClickBound = (e) => {
      const notificationId = e.currentTarget.dataset.notificationId;
      this.handleNotificationClick(notificationId);
    };
    
    item.addEventListener('click', this.handleNotificationClickBound);
  });
}

handleMarkAllAsRead() {
  const markAllBtn = document.getElementById('mark-all-read-btn');

  markAllBtn.disabled = true;
  markAllBtn.textContent = 'Memproses...';

  this.presenter.markAllAsRead().then(() => {
    markAllBtn.disabled = false;
    markAllBtn.textContent = 'Tandai Semua Dibaca';
  });
}

showLoading() {
  const container = document.getElementById('notification-container');
  const loading = document.getElementById('notification-loading');
  const error = document.getElementById('notification-error');
  const markAllBtn = document.getElementById('mark-all-read-btn');

  container.classList.add('hidden');
  error.classList.add('hidden');
  markAllBtn.classList.add('hidden');
  loading.classList.remove('hidden');
}

handleNotificationClick(notificationId) {
  const notification = this.notifications.find(n => n.id === notificationId);
  if (notification) {
    const wasUnread = !notification.read;

    if (wasUnread) {
      this.updateNotificationReadStatus(notificationId);
    }

    if (notification.type === 'comment' && notification.storyId) {
      window.location.hash = `#/story/${notification.storyId}`;
    } else if (notification.type === 'reply' && notification.storyId) {
      window.location.hash = `#/story/${notification.storyId}`;
    } else if (notification.type === 'reminder') {
      window.location.hash = '#/calendar';
    }

    if (wasUnread) {
      this.presenter.markAsRead(notificationId).catch(error => {
        console.warn('Failed to mark notification as read on server, but UI updated locally:', error);
      });
    }
  }
}

updateNotificationReadStatus(notificationId) {
  const notification = this.notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
  }

  const notificationElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
  if (notificationElement) {
    notificationElement.classList.add('opacity-60');

    const indicator = notificationElement.querySelector('.bg-third');
    if (indicator) {
      indicator.remove();
    }
  }

  this.updateMarkAllButtonVisibility();
}

updateAllNotificationsReadStatus() {
  this.notifications.forEach(notification => {
    notification.read = true;
  });

  const notificationElements = document.querySelectorAll('[data-notification-id]');
  notificationElements.forEach(element => {
    element.classList.add('opacity-60');

    const indicator = element.querySelector('.bg-third');
    if (indicator) {
      indicator.remove();
    }
  });

  const markAllBtn = document.getElementById('mark-all-read-btn');
  if (markAllBtn) {
    markAllBtn.classList.add('hidden');
  }
}

updateMarkAllButtonVisibility() {
  const markAllBtn = document.getElementById('mark-all-read-btn');
  if (markAllBtn) {
    const hasUnreadNotifications = this.notifications.some(n => !n.read);
    if (hasUnreadNotifications) {
      markAllBtn.classList.remove('hidden');
    } else {
      markAllBtn.classList.add('hidden');
    }
  }
}
}