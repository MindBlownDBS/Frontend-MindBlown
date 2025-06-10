import { getChatHistory } from '../../data/api';

export default class ChatbotPresenter {
  constructor() {
    this.chatHistory = [];
  }
  
  async loadChatHistory() {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!userData || !userData.token) {
        console.log('User not logged in, skipping chat history fetch');
        return [];
      }

      const result = await getChatHistory();
      
      if (result.error) {
        throw new Error(result.message);
      }
      
        this.chatHistory = result.data?.chats ? [...result.data.chats].reverse() : [];
      return this.chatHistory;
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  }
  
  getChatHistory() {
    return this.chatHistory;
  }
  
  formatChatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const options = { hour: '2-digit', minute: '2-digit' };
    
    if (isToday) {
      return `Hari ini, ${date.toLocaleTimeString('id-ID', options)}`;
    } else {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
}