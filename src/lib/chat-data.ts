import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  displayName: string;
  photoURL: string;
  email: string;
  role: string;
}


export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
  isPaid?: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage: string;
  updatedAt: Timestamp;
}
