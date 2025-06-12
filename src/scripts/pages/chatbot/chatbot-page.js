import ChatbotPresenter from './chatbot-presenter';
import { userChatBubble, botChatBubble, botTypingBubble, showToast } from '../templates';
import { autoResize } from '../../utils';
import { BASE_URL } from '../../config';

export default class ChatbotPage {
    constructor() {
        this.sessionId = localStorage.getItem('sessionId') || this.#generateSessionId();
        localStorage.setItem('sessionId', this.sessionId);
        this.socket = null;
        this.connectionId = null;
        this.anonymousId = null;
        this.isAnonymous = true;
        this.pendingRequests = new Map();
        this.presenter = new ChatbotPresenter();
    }

    #generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    #generateRequestId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    async render() {
        return `
       <section class="ml-0 md:ml-8 lg:ml-16 min-h-screen flex">
        <div class="w-full flex items-center pb-50"> 
            <div class="max-w-2xl w-full mx-auto text-center">
                
                <div id="chat-container" class="flex flex-col gap-2 px-6 lg:px-4 overflow-y-auto max-h-full md:max-h[80vh] lg:max-h-[75vh] pb-10">
                    <div id="connection-status" class="hidden text-center py-2 text-sm text-gray-500">
                        Menghubungkan ke MindBlown...
                    </div>
                </div>
                
                <form id="chat-form" class="fixed bottom-24 lg:bottom-6 z-50 w-full lg:w-full md:max-w-2xl lg:max-w-2xl mx-auto px-4 lg:px-0 flex gap-2">
                    <textarea 
                      id="chat-input"
                      class="text-[#8c8c8c] w-full h-16 md:h-20 lg:h-24 px-4 py-3 pr-14 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent overflow-hidden placeholder:leading-[2rem] md:placeholder:leading-[3rem] lg:placeholder:leading-[4rem]"
                      placeholder="Cerita sedikit..." disabled></textarea>
                    <button id="send-button" class="absolute right-6 lg:right-3 top-1/2 transform -translate-y-1/2 rounded-full bg-[#eee] p-2 flex items-center justify-center hover:bg-third focus:bg-third transition cursor-pointer" disabled>
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="-0.5 -0.5 16 16" stroke-linecap="round" stroke-linejoin="round" stroke="white" id="Send--Streamline-Mynaui" height="16" width="16">
                            <path d="m8.75 6.25 -1.875 1.875m5.805 -6.230625a0.33437500000000003 0.33437500000000003 0 0 1 0.42500000000000004 0.42562500000000003l-3.7025 10.58125a0.33437500000000003 0.33437500000000003 0 0 1 -0.62125 0.025l-2.011875 -4.52625a0.33375 0.33375 0 0 0 -0.169375 -0.169375l-4.52625 -2.0125a0.33437500000000003 0.33437500000000003 0 0 1 0.025 -0.620625z" stroke-width="1"></path>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
      </section>
        `;
    }

    async afterRender() {
        const chatContainer = document.getElementById('chat-container');
        const connectionStatus = document.getElementById('connection-status');
        const form = document.getElementById('chat-form');
        const input = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-button');

        chatContainer.insertAdjacentHTML('beforeend', `
        <div id="chat-history-divider" class="hidden border-t border-gray-200 my-4 relative">
            <span class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs text-gray-400">
                Riwayat chat sebelumnya
            </span>
        </div>
    `);

        input.addEventListener('input', () => autoResize(input));

        const scrollToBottom = () => {
            requestAnimationFrame(() => {

                chatContainer.scrollTop = chatContainer.scrollHeight;
            });
        };

        this.connectWebSocket(chatContainer, connectionStatus, input, sendButton, scrollToBottom);

        try {
            const chatHistory = await this.presenter.loadChatHistory();
            const chatHistoryDivider = document.getElementById('chat-history-divider');

            if (chatHistory && chatHistory.length > 0) {
                chatHistoryDivider.classList.remove('hidden');

                chatHistory.forEach(chat => {
                    const timestamp = this.presenter.formatChatDate(chat.timestamp);

                    chatContainer.insertAdjacentHTML('beforeend',
                        `<div class="text-center my-2">
                            <span class="text-xs text-gray-400">${timestamp}</span>
                        </div>`);

                    chatContainer.insertAdjacentHTML('beforeend', userChatBubble(chat.message));
                    chatContainer.insertAdjacentHTML('beforeend', botChatBubble(chat.response));
                });

                chatContainer.insertAdjacentHTML('beforeend',
                    `<div class="border-t border-gray-200 my-4 relative">
                        <span class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs text-gray-400">
                            Chat baru
                        </span>
                    </div>`);

                scrollToBottom();

            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }

        setTimeout(() => {
            const pendingMessage = localStorage.getItem('pendingChatMessage');
            if (pendingMessage) {
                console.log('Received message from homepage:', pendingMessage);

                localStorage.removeItem('pendingChatMessage');

                if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                    const requestId = this.#generateRequestId();

                    chatContainer.insertAdjacentHTML('beforeend', userChatBubble(pendingMessage));
                    scrollToBottom();

                    this.pendingRequests.set(requestId, {
                        message: pendingMessage,
                        timestamp: new Date()
                    });

                    this.socket.send(JSON.stringify({
                        type: "chatbot_request",
                        message: pendingMessage,
                        requestId: requestId
                    }));
                } else {
                    console.error('WebSocket not connected, cannot send message from homepage');
                    chatContainer.insertAdjacentHTML('beforeend',
                        botChatBubble("Maaf, koneksi terputus. Silakan coba lagi nanti."));
                    scrollToBottom();
                }
            }
        }, 1000);

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (!text) return;

            localStorage.setItem('hasInteractedWithChatbot', 'true');

            const requestId = this.#generateRequestId();

            chatContainer.insertAdjacentHTML('beforeend', userChatBubble(text));
            scrollToBottom();

            input.value = '';
            input.style.height = '';

            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.pendingRequests.set(requestId, {
                    message: text,
                    timestamp: new Date()
                });

                this.socket.send(JSON.stringify({
                    type: "chatbot_request",
                    message: text,
                    requestId: requestId
                }));
            } else {
                chatContainer.insertAdjacentHTML('beforeend',
                    botChatBubble("Maaf, koneksi terputus. Silakan refresh halaman untuk mencoba lagi."));
                scrollToBottom();
            }
        });
    }

    connectWebSocket(chatContainer, connectionStatus, input, sendButton, scrollToBottom) {
        try {
            const wsUrl = BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');
            this.socket = new WebSocket(`${wsUrl}/chatbot-ws`);

            this.socket.onopen = () => {
                connectionStatus.classList.add('hidden');
                input.disabled = false;
                sendButton.disabled = false;

                const userData = JSON.parse(localStorage.getItem('user'));
               

                if (userData) {
                    const userId = userData.userId || userData.id;

                    if (!userId && userData.token) {
                        try {
                            const base64Url = userData.token.split('.')[1];
                            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                            const decodedData = JSON.parse(window.atob(base64));
                           

                            if (decodedData.id || decodedData.sub) {
                                const tokenId = decodedData.id || decodedData.sub;
                                

                                this.socket.send(JSON.stringify({
                                    type: "auth",
                                    userId: tokenId
                                }));
                                return;
                            }
                        } catch (error) {
                            console.error('Error decoding token:', error);
                        }
                    }

                    if (userId) {
                       
                        this.socket.send(JSON.stringify({
                            type: "auth",
                            userId: userId
                        }));
                    } else {
                        console.warn('No user ID found in user data');
                    }
                }
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('WebSocket message received:', data);

                    switch (data.type) {
                        case 'connected':
                            this.connectionId = data.connectionId;
                            this.anonymousId = data.anonymousId;
                            this.isAnonymous = data.isAnonymous;
                            connectionStatus.classList.add('hidden');
                            break;

                        case 'auth_success':
                            this.isAnonymous = false;
                            connectionStatus.classList.add('hidden');
                            break;

                        case 'auth_anonymous':
                            this.isAnonymous = true;
                            this.anonymousId = data.anonymousId;
                            connectionStatus.classList.add('hidden');
                            break;

                        case 'chatbot_processing':
                            const typingIndicatorId = `typing-${data.requestId}`;
                            if (!document.getElementById(typingIndicatorId)) {
                                chatContainer.insertAdjacentHTML('beforeend',
                                    botTypingBubble(data.message, data.requestId));
                                scrollToBottom();
                            }
                            break;

                        case 'chatbot_response':
                            const typingElement = document.getElementById(`typing-${data.requestId}`);
                            if (typingElement) {
                                typingElement.remove();
                            }

                            chatContainer.insertAdjacentHTML('beforeend',
                                botChatBubble(data.data.response));
                            scrollToBottom();

                            this.pendingRequests.delete(data.requestId);
                            break;

                        case 'chatbot_error':
                            const errorTypingElement = document.getElementById(`typing-${data.requestId}`);
                            if (errorTypingElement) {
                                errorTypingElement.remove();
                            }

                            chatContainer.insertAdjacentHTML('beforeend',
                                botChatBubble(`Maaf, terjadi kesalahan: ${data.message}`));
                            scrollToBottom();

                            this.pendingRequests.delete(data.requestId);
                            break;

                        case 'error':
                            showToast(data.message, 'error');
                            break;

                        default:
                            console.warn('Unknown message type:', data.type);
                    }
                } catch (error) {
                    console.error('Error handling WebSocket message:', error);
                }
            };

            this.socket.onclose = (event) => {
                console.log('WebSocket connection closed:', event);
                connectionStatus.classList.remove('hidden');
                connectionStatus.textContent = 'Koneksi terputus';
                connectionStatus.classList.remove('text-green-500');
                connectionStatus.classList.add('text-red-500');
                input.disabled = true;
                sendButton.disabled = true;

                setTimeout(() => {
                    if (document.getElementById('chat-container')) {
                        connectionStatus.textContent = 'Mencoba menghubungkan kembali...';
                        connectionStatus.classList.remove('text-red-500');
                        connectionStatus.classList.add('text-yellow-500');
                        this.connectWebSocket(chatContainer, connectionStatus, input, sendButton, scrollToBottom);
                    }
                }, 3000);
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                connectionStatus.classList.remove('hidden');
                connectionStatus.textContent = 'Koneksi error';
                connectionStatus.classList.remove('text-green-500');
                connectionStatus.classList.add('text-red-500');
            };

        } catch (error) {
            console.error('Error connecting to WebSocket:', error);
            connectionStatus.classList.remove('hidden');
            connectionStatus.textContent = 'Gagal terhubung';
            connectionStatus.classList.add('text-red-500');
        }
    }
}