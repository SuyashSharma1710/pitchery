import { Reachout } from "@/types";
import {
  IMessageService,
  CreateReachoutDTO,
  IMessageRepository,
} from "@/core/interfaces/message.interface";

export class MessageService implements IMessageService {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async getInboxMessages(userId: string): Promise<Reachout[]> {
    return await this.messageRepository.findByReceiverId(userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.messageRepository.countUnread(userId);
  }

  async createReachout(dto: CreateReachoutDTO): Promise<Reachout> {
    const reachoutId = "reachout-" + Math.random().toString(36).substring(2, 9);

    return await this.messageRepository.create({
      id: reachoutId,
      senderId: dto.senderId || null,
      receiverId: dto.receiverId,
      startupId: dto.startupId || null,
      senderName: dto.senderName.trim(),
      senderEmail: dto.senderEmail.trim(),
      subject: dto.subject.trim(),
      message: dto.message.trim(),
      isRead: false,
    });
  }

  async markAsRead(messageId: string, userId: string): Promise<boolean> {
    return await this.messageRepository.markAsRead(messageId, userId);
  }
}
