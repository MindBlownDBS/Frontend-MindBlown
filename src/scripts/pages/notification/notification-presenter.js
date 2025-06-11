import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../data/api.js';

export default class NotificationPresenter {
  constructor(view) {
    this.view = view;
  }

  async loadNotifications() {
    try {
      const result = await getNotifications();
      
      if (result.error) {
        this.view.showError(result.message);
        return;
      }

      const formattedNotifications = this.formatNotifications(result.data);
      this.view.displayNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      this.view.showError('Gagal memuat notifikasi');
    }
  }

  formatNotifications(notifications) {
    return notifications.map(notification => ({
      id: notification._id,
      icon: this.getNotificationIcon(notification.type),
      title: this.getNotificationTitle(notification.type),
      message: notification.message,
      type: notification.type,
      read: notification.read,
      createdAt: notification.createdAt,
      storyId: notification.storyId,
      commentId: notification.commentId,
      fromUsername: notification.fromUsername
    }));
  }

  getNotificationTitle(type) {
    const titles = {
      comment: 'Komentar Baru',
      reply: 'Balasan Komentar',
      like: 'Suka',
      story: 'Story Baru',
      follow: 'Pengikut Baru',
      reminder: 'Pengingat',
      system: 'Sistem'
    };
    return titles[type] || 'Notifikasi';
  }

  getNotificationIcon(type) {
    const icons = {
      comment: 'images/logo.png',
      reply: 'images/logo.png',
      like: 'images/logo.png',
      story: 'images/logo.png',
      follow: 'images/logo.png',
      reminder: 'images/logo.png',
      system: 'images/logo.png'
    };
    return icons[type] || 'images/logo.png';
  }

  async markAsRead(notificationId) {
    try {
      const result = await markNotificationAsRead(notificationId);
      
      if (result.error) {
        console.error('Error marking notification as read:', result.message);
        return false;
      }

      this.view.updateNotificationReadStatus(notificationId);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  async markAllAsRead() {
    try {
      const result = await markAllNotificationsAsRead();
      
      if (result.error) {
        console.error('Error marking all notifications as read:', result.message);
        
        if (result.message.includes('terhubung ke server')) {
          console.warn('Network error - updating all notifications UI optimistically');
          this.view.updateAllNotificationsReadStatus();
          this.view.showSuccessMessage('Semua notifikasi ditandai sebagai dibaca (offline)');
          return true;
        }
        
        this.view.showError(result.message);
        return false;
      }

      this.view.updateAllNotificationsReadStatus();
      this.view.showSuccessMessage('Semua notifikasi ditandai sebagai dibaca');
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      this.view.showError('Gagal menandai semua notifikasi sebagai dibaca');
      return false;
    }
  }
}