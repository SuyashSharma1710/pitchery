import { Reachout } from "@/types";

export interface CreateReachoutDTO {
  senderId?: string | null;
  receiverId: string;
  startupId?: string | null;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
}

export interface ReachoutCreateEntity {
  id: string;
  senderId: string | null;
  receiverId: string;
  startupId: string | null;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  isRead: boolean;
}

/**
 * Data Access Contract for Messages / Reachouts (Repository Pattern)
 */
export interface IMessageRepository {
  findByReceiverId(receiverId: string): Promise<Reachout[]>;
  countUnread(receiverId: string): Promise<number>;
  create(entity: ReachoutCreateEntity): Promise<Reachout>;
  markAsRead(messageId: string, receiverId: string): Promise<boolean>;
}

/**
 * High-level business contract for Messages / Reachouts
 */
export interface IMessageService {
  getInboxMessages(userId: string): Promise<Reachout[]>;
  getUnreadCount(userId: string): Promise<number>;
  createReachout(dto: CreateReachoutDTO): Promise<Reachout>;
  markAsRead(messageId: string, userId: string): Promise<boolean>;
}
