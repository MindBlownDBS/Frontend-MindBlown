export function transitionHelper({ skipTransition = false, updateDOM }) {
    if (skipTransition || !document.startViewTransition) {
        const updateCallbackDone = Promise.resolve(updateDOM()).then(() => undefined);

        return {
            ready: Promise.reject(Error('View transitions unsupported')),
            updateCallbackDone,
            finished: updateCallbackDone,
        };
    }

    return document.startViewTransition(updateDOM);
}

export function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

export function formatTimeAgo(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit yang lalu`;
  if (hours < 24) return `${hours} jam yang lalu`;
  if (days < 7) return `${days} hari yang lalu`;
  return date.toLocaleDateString('id-ID');
}

export function isServiceWorkerAvailable() {
  return 'serviceWorker' in navigator;
}
 
export async function registerServiceWorker() {
  if (!isServiceWorkerAvailable()) {
    console.log('Service Worker API unsupported');
    return;
  }
 
  try {
    const registration = await navigator.serviceWorker.register('/sw.bundle.js');
    console.log('Service worker telah terpasang', registration);
  } catch (error) {
    console.log('Failed to install service worker:', error);
  }
}

export function convertBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


