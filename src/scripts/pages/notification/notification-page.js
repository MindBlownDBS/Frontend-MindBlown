import { notificationListTemplate } from '../templates';
import NotificationPresenter from './notification-presenter.js';
import { isServiceWorkerAvailable } from '../../utils/index.js';
import { subscribe, unsubscribe, isCurrentPushSubscriptionAvailable } from '../../utils/notification-helper';

export default class NotificationPage {
  constructor() {
    this.presenter = new NotificationPresenter(this);
    this.notifications = [];
    this.isSubscribed = false;
    this.isSupported = false;
    this.currentPage = 1;
    this.itemsPerPage = 8; 
    this.totalPages = 1;
  }

  async render() {
    return `
      <section class="lg:p-10 p-6 md:p-6 pb-20">
        <div class="max-w-xl w-full ml-0 md:ml-16 lg:ml-16 text-left">
          <div class="flex justify-between items-center ">
            <h1 class="text-2xl font-semibold">Pemberitahuan</h1> 
          </div>
          <hr class="my-4 text-gray-300">

        <div class="flex justify-between items-center mb-6"> 
          <div id="push-notification-container">
            <!-- Push notification button akan di-render di sini -->
          </div>
          <button id="mark-all-read-btn" class="text-sm text-third hover:text-third/80 hidden">
            Tandai Semua Dibaca
          </button>
        </div>
         
          
          <div id="notification-loading" class="text-center py-8">
            <p class="text-gray-500">Memuat notifikasi...</p>
          </div>
          
          <div id="notification-container" class="hidden">
            <div id="notification-list">
            </div>
            
            <div id="pagination-container" class="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 hidden">
              <button id="prev-btn" class="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                <!-- Desktop: Text lengkap -->
                <span class="hidden sm:inline">← Sebelumnya</span>
                <!-- Mobile: Simbol -->
                <span class="sm:hidden text-lg">‹</span>
              </button>
              
              <span id="page-info" class="text-sm text-gray-600 font-medium">
                <span class="sm:hidden">1/1</span>
                <span class="hidden sm:inline">Halaman 1 dari 1</span>
              </span>
              
              <button id="next-btn" class="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                <!-- Desktop: Text lengkap -->
                <span class="hidden sm:inline">Selanjutnya →</span>
                <!-- Mobile: Simbol -->
                <span class="sm:hidden text-lg">›</span>
              </button>
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
    await this.setupPushNotificationButton();
    await this.presenter.loadNotifications();
    this.attachEventListeners();
  }

  async setupPushNotificationButton() {
    const container = document.getElementById('push-notification-container');

    try {
      const isSubscribed = await isCurrentPushSubscriptionAvailable();

      if (isSubscribed) {
        container.innerHTML = `
          <button id="push-notification-btn" class="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors" data-action="unsubscribe">
            Nonaktifkan Push Notifikasi
          </button>
        `;
      } else {
        container.innerHTML = `
          <button id="push-notification-btn" class="px-4 py-2 bg-third text-white text-sm rounded-lg hover:bg-third/90 transition-colors" data-action="subscribe">
            Aktifkan Push Notifikasi
          </button>
        `;
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      container.innerHTML = `
        <button id="push-notification-btn" class="px-4 py-2 bg-third text-white text-sm rounded-lg hover:bg-third/90 transition-colors" data-action="subscribe">
          Aktifkan Push Notifikasi
        </button>
      `;
    }
  }

  async handlePushNotificationToggle() {
    const btn = document.getElementById('push-notification-btn');
    const action = btn.dataset.action;
    const originalText = btn.textContent;
    
    btn.disabled = true;
    btn.textContent = 'Memproses...';
    
    try {
      if (action === 'subscribe') {
        await subscribe();
        this.showSuccessMessage('Push notification berhasil diaktifkan!');
        
        btn.textContent = 'Nonaktifkan Push Notifikasi';
        btn.className = 'px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors';
        btn.dataset.action = 'unsubscribe';
        
      } else {
        await unsubscribe();
        this.showSuccessMessage('Push notification berhasil dinonaktifkan!');
        
        btn.textContent = 'Aktifkan Push Notifikasi';
        btn.className = 'px-4 py-2 bg-third text-white text-sm rounded-lg hover:bg-third/90 transition-colors';
        btn.dataset.action = 'subscribe';
      }
    } catch (error) {
      console.error('Error toggling push notification:', error);
      
      if (action === 'subscribe') {
        alert('Gagal mengaktifkan push notification: ' + error.message);
      } else {
        alert('Gagal menonaktifkan push notification: ' + error.message);
      }
      
      btn.textContent = originalText;
    } finally {
      btn.disabled = false;
    }
  }

  displayNotifications(notifications) {
    this.notifications = notifications;
    this.currentPage = 1;
    this.totalPages = Math.ceil(notifications.length / this.itemsPerPage);

    const container = document.getElementById('notification-container');
    const loading = document.getElementById('notification-loading');
    const error = document.getElementById('notification-error');

    loading.classList.add('hidden');
    error.classList.add('hidden');

    if (notifications.length === 0) {
      const listContainer = document.getElementById('notification-list');
      listContainer.innerHTML = `
        <div class="text-center py-8">
          <p class="text-gray-500">Belum ada notifikasi</p>
        </div>
      `;
      this.hidePagination();
      this.hideMarkAllButton();
    } else {
      this.renderCurrentPage();
      this.updatePagination();
      this.updateMarkAllButtonVisibility();
    }

    container.classList.remove('hidden');
  }

  renderCurrentPage() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const currentNotifications = this.notifications.slice(startIndex, endIndex);
    
    const listContainer = document.getElementById('notification-list');
    listContainer.innerHTML = notificationListTemplate(currentNotifications);
    
    this.attachNotificationClickListeners();
  }

  updatePagination() {
    const paginationContainer = document.getElementById('pagination-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('page-info');

    if (this.totalPages <= 1) {
      this.hidePagination();
      return;
    }

    paginationContainer.classList.remove('hidden');
    pageInfo.textContent = `Halaman ${this.currentPage} dari ${this.totalPages}`;
    prevBtn.disabled = this.currentPage === 1;
    nextBtn.disabled = this.currentPage === this.totalPages;
  }

  hidePagination() {
    const paginationContainer = document.getElementById('pagination-container');
    paginationContainer.classList.add('hidden');
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.renderCurrentPage();
      this.updatePagination();
      document.getElementById('notification-list').scrollIntoView({ behavior: 'smooth' });
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.renderCurrentPage();
      this.updatePagination();
      document.getElementById('notification-list').scrollIntoView({ behavior: 'smooth' });
    }
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

    const pushBtn = document.getElementById('push-notification-btn');
    if (pushBtn) {
      pushBtn.addEventListener('click', () => {
        this.handlePushNotificationToggle();
      });
    }

    const prevBtn = document.getElementById('prev-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.goToPreviousPage();
      });
    }

    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.goToNextPage();
      });
    }

    this.attachNotificationClickListeners();
  }

  updateNotificationReadStatus(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }

    this.renderCurrentPage();
    this.updateMarkAllButtonVisibility();
  }

  updateAllNotificationsReadStatus() {
    this.notifications.forEach(notification => {
      notification.read = true;
    });

    this.renderCurrentPage();
    this.hideMarkAllButton();
  }

  hideMarkAllButton() {
    const markAllBtn = document.getElementById('mark-all-read-btn');
    if (markAllBtn) {
      markAllBtn.classList.add('hidden');
    }
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