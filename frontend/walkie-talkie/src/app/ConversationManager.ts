import { DoubleRatchet, RatchetState } from './DoubleRatchet';

interface ConversationData {
  recipientId: string;
  ratchetState: RatchetState;
  theirIdentityKey: string;
  createdAt: number;
}

export class ConversationManager {
  // Save conversation state to localStorage
  static saveConversation(
    recipientId: string,
    data: Omit<ConversationData, 'recipientId' | 'createdAt'>
  ): void {
    const conversation: ConversationData = {
      recipientId,
      ...data,
      createdAt: Date.now(),
    };
    
    localStorage.setItem(
      `conversation_${recipientId}`,
      JSON.stringify(conversation)
    );
  }

  // Load conversation state from localStorage
  static loadConversation(recipientId: string): ConversationData | null {
    const data = localStorage.getItem(`conversation_${recipientId}`);
    if (!data) return null;
    
    return JSON.parse(data);
  }

  // Check if conversation exists
  static hasConversation(recipientId: string): boolean {
    return localStorage.getItem(`conversation_${recipientId}`) !== null;
  }

  // Delete conversation
  static deleteConversation(recipientId: string): void {
    localStorage.removeItem(`conversation_${recipientId}`);
  }
}