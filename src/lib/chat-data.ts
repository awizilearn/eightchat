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
  subscriptions?: string[];
}


export interface Message {
  id: string;
  senderId: string;
  // The 'text' will be the encrypted message (ciphertext) for the recipient.
  text: string;
  // The 'plaintext' is for the sender to read their own messages.
  // It's secured by Firestore rules.
  plaintext?: string;
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

export interface ModerationAction {
  actionType: "contentApproved" | "userBanned" | "warningIssued" | "contentRejected" | "userMuted";
  targetType: "user" | "post";
  targetId: string;
  moderatorId: string;
  timestamp: Timestamp;
  reason?: string;
  duration?: number; // Duration in hours, if applicable
}

export interface Transaction {
    id: string;
    type: 'sub' | 'payout' | 'tip';
    description: string;
    date: string;
    method: 'Stripe' | 'ETH' | 'Crypto';
    amount: number;
    status?: 'completed' | 'pending';
}
