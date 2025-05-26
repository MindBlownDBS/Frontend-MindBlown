import { notificationListTemplate } from '../templates';

export default class NotificationPage {
    async render() {
      // Notifikasi dummy
      const notifications = [
        {
          icon: 'images/logo.png',
          title: '',
          message: 'Hai, waktunya cek perasaanmu hari ini. Satu menit untuk dirimu sendiri bisa berarti banyak.'
        },
        {
          icon: 'images/logo.png',
          title: '',
          message: 'Gimana harimu sejauh ini? Yuk luangkan waktu sebentar buat refleksi bareng MindBlown.'
        },
        {
          icon: 'images/logo.png',
          title: '',
          message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
        }
      ];
      return `
        <section class="p-8">
          ${notificationListTemplate(notifications)}
        </section>
      `;
    }
  
    async afterRender() {
    }
  }
