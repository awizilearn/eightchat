import { Timestamp } from "firebase/firestore";

export interface SubscriptionTier {
  name: 'Bronze' | 'Silver' | 'Gold';
  price: number;
  perks: string[];
  cta: string;
}

export interface Content {
    id: string;
    title: string;
    type: 'image' | 'video' | 'article';
    imageUrl: string;
    tier: 'Bronze' | 'Silver' | 'Gold';
}

export interface UserProfile {
  id: string;
  displayName: string;
  photoURL: string;
  email: string;
  role: 'admin' | 'abonne' | 'createur' | 'moderateur' | 'agence';
  signalPreKeyBundle: object;
  bio?: string;
  longBio?: string;
  category?: string;
  bannerUrl?: string;
  tiers?: SubscriptionTier[];
  content?: Content[];
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
