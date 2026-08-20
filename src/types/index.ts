export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  image?: string | null;
  bio?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Startup {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  image: string;
  pitch: string;
  views: number;
  authorId: string;
  author?: User;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface Comment {
  id: string;
  startupId: string;
  userId: string;
  content: string;
  createdAt: string | Date;
  user?: User;
}

export type ReachoutStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export interface ReachoutReply {
  id: string;
  reachoutId: string;
  senderId: string;
  message: string;
  createdAt: string | Date;
  sender?: User;
}

export interface Reachout {
  id: string;
  senderId?: string | null;
  receiverId: string;
  startupId?: string | null;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  status: ReachoutStatus;
  isRead: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
  startup?: Startup;
  sender?: User;
  receiver?: User;
  replies?: ReachoutReply[];
}

export interface Vote {
  id: string;
  userId: string;
  startupId: string;
  createdAt: string | Date;
}

export interface StartupFormValues {
  title: string;
  description: string;
  category: string;
  image: string;
  pitch: string;
}

export interface SearchParams {
  query?: string;
  category?: string;
}
