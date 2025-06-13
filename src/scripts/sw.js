import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import {
    NetworkFirst,
    CacheFirst,
    StaleWhileRevalidate,
} from 'workbox-strategies';
import { BASE_URL } from './config';

const manifest = self.__WB_MANIFEST;
precacheAndRoute(manifest);

registerRoute(
    ({ request, url }) => {
        const baseUrl = new URL(BASE_URL);
        return baseUrl.origin === url.origin && request.destination !== 'image';
    },
    new NetworkFirst({
        cacheName: 'Mindblown-api',
    })
);
registerRoute(
    ({ request, url }) => {
        const baseUrl = new URL(BASE_URL);
        return baseUrl.origin === url.origin && request.destination === 'image';
    },
    new StaleWhileRevalidate({
        cacheName: 'mindblown-api-images',
    })
);

self.addEventListener('push', (event) => {
    console.log('🔔 Service worker received push event');

    async function handlePushNotification() {
        try {
            let data;

            if (event.data) {
                data = await event.data.json();
                console.log('📱 Push data from backend:', data);
            } else {
                data = {
                    title: 'MindBlown Notification',
                    body: 'Anda memiliki notifikasi baru',
                };
                console.log('Using fallback data:', data);
            }

            const options = {
                body: data.body,
                icon: '/images/logo.png',
                badge: '/images/logo.png',
                tag: 'mindblown-manual-test',
                requireInteraction: true,
                vibrate: [200, 100, 200],
                data: data,
            };

            await self.registration.showNotification(
                data.title || 'MindBlown',
                options
            );

            console.log('Notification shown successfully');
        } catch (error) {
            console.error('Error in push notification handler:', error);

            await self.registration.showNotification('MindBlown', {
                body: 'Anda memiliki notifikasi baru',
                icon: '/images/logo.png',
                badge: '/images/logo.png',
                tag: 'mindblown-error',
            });
        }
    }

    event.waitUntil(handlePushNotification());
});

self.addEventListener('notificationclick', (event) => {
    console.log('👆 Notification clicked - redirecting to notifications page');
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (
                    client.url.includes(self.location.origin) &&
                    'focus' in client
                ) {
                    client.focus();
                    return client.navigate(
                        self.location.origin + '/#/notification'
                    );
                }
            }

            if (clients.openWindow) {
                return clients.openWindow('/#/notification');
            }
        })
    );
});

self.addEventListener('install', (event) => {
    console.log('Service worker installing');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service worker activating');
    event.waitUntil(clients.claim());
});
