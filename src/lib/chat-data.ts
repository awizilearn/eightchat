import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  displayName: string;
  photoURL: string;
  email: string;
  role: string;
  // This will be a serialized PreKeyBundle.
  signalPreKeyBundle: object;
}


export interface Message {
  id: string;
  senderId: string;
  // The 'text' will be the encrypted message (ciphertext).
  // The type of ciphertext from libsignal is a string.
  text: string;
  createdAt: Timestamp;
  isPaid?: boolean;
  contentTitle?: string;
  contentPrice?: number;
  contentImageUrl?: string;
  contentType?: 'video' | 'image' | 'audio' | 'text';
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage: string;
  updatedAt: Timestamp;
}
