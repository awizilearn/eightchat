import { Timestamp } from "firebase/firestore";

export interface Participant {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

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
  // This will be enriched on the client
  otherParticipant?: (UserProfile & { id: string }) | undefined;
}
