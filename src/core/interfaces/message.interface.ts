import { Reachout, ReachoutReply, ReachoutStatus } from "@/types";

export interface CreateReachoutDTO {
  senderId: string;
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
  status: ReachoutStatus;
  isRead: boolean;
}

export interface CreateReplyDTO {
  reachoutId: string;
  senderId: string;
  message: string;
}

/**
 * Data Access Contract for Messages / Reachouts (Repository Pattern)
 */
export interface IMessageRepository {
  findByReceiverId(receiverId: string): Promise<Reachout[]>;
  findBySenderId(senderId: string): Promise<Reachout[]>;
  findById(id: string): Promise<Reachout | null>;
  findExistingReachout(senderId: string, startupId: string): Promise<Reachout | null>;
  countUnread(receiverId: string): Promise<number>;
  create(entity: ReachoutCreateEntity): Promise<Reachout>;
  updateStatus(id: string, status: ReachoutStatus, receiverId: string): Promise<Reachout | null>;
  addReply(reply: { id: string; reachoutId: string; senderId: string; message: string }): Promise<ReachoutReply>;
  markAsRead(messageId: string, userId: string): Promise<boolean>;
}

/**
 * High-level business contract for Messages / Reachouts
 */
export interface IMessageService {
  getInboxMessages(userId: string): Promise<Reachout[]>;
  getSentReachouts(userId: string): Promise<Reachout[]>;
  getReachoutById(id: string, userId: string): Promise<Reachout | null>;
  checkExistingReachout(senderId: string, startupId: string): Promise<Reachout | null>;
  getUnreadCount(userId: string): Promise<number>;
  createReachout(dto: CreateReachoutDTO): Promise<Reachout>;
  toggleTalkMore(reachoutId: string, status: ReachoutStatus, receiverId: string): Promise<Reachout>;
  sendReply(dto: CreateReplyDTO): Promise<ReachoutReply>;
  markAsRead(messageId: string, userId: string): Promise<boolean>;
}

