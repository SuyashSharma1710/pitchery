import { Reachout, ReachoutReply, ReachoutStatus } from "@/types";
import {
  IMessageService,
  CreateReachoutDTO,
  CreateReplyDTO,
  IMessageRepository,
} from "@/core/interfaces/message.interface";

export class MessageService implements IMessageService {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async getInboxMessages(userId: string): Promise<Reachout[]> {
    return await this.messageRepository.findByReceiverId(userId);
  }

  async getSentReachouts(userId: string): Promise<Reachout[]> {
    return await this.messageRepository.findBySenderId(userId);
  }

  async getReachoutById(id: string, userId: string): Promise<Reachout | null> {
    const reachout = await this.messageRepository.findById(id);
    if (!reachout) return null;
    // Only sender or receiver can access this private conversation
    if (reachout.receiverId !== userId && reachout.senderId !== userId) {
      return null;
    }
    return reachout;
  }

  async checkExistingReachout(senderId: string, startupId: string): Promise<Reachout | null> {
    return await this.messageRepository.findExistingReachout(senderId, startupId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.messageRepository.countUnread(userId);
  }

  async createReachout(dto: CreateReachoutDTO): Promise<Reachout> {
    if (!dto.senderId) {
      throw new Error("You must be logged in to send a reachout message.");
    }

    if (dto.senderId === dto.receiverId) {
      throw new Error("You cannot send a reachout to yourself.");
    }

    // Rate Limit: 1 reachout per pitch
    if (dto.startupId) {
      const existing = await this.messageRepository.findExistingReachout(
        dto.senderId,
        dto.startupId
      );
      if (existing) {
        throw new Error(
          "You have already sent a reachout for this pitch. Please wait for the founder to accept Talk More."
        );
      }
    }

    const reachoutId = "reachout-" + Math.random().toString(36).substring(2, 9);

    return await this.messageRepository.create({
      id: reachoutId,
      senderId: dto.senderId,
      receiverId: dto.receiverId,
      startupId: dto.startupId || null,
      senderName: dto.senderName.trim(),
      senderEmail: dto.senderEmail.trim(),
      subject: dto.subject.trim(),
      message: dto.message.trim(),
      status: "PENDING",
      isRead: false,
    });
  }

  async toggleTalkMore(
    reachoutId: string,
    status: ReachoutStatus,
    receiverId: string
  ): Promise<Reachout> {
    const updated = await this.messageRepository.updateStatus(
      reachoutId,
      status,
      receiverId
    );
    if (!updated) {
      throw new Error("Unable to update reachout status or permission denied.");
    }
    return updated;
  }

  async sendReply(dto: CreateReplyDTO): Promise<ReachoutReply> {
    const reachout = await this.messageRepository.findById(dto.reachoutId);
    if (!reachout) {
      throw new Error("Reachout conversation not found.");
    }

    const isSender = reachout.senderId === dto.senderId;
    const isReceiver = reachout.receiverId === dto.senderId;

    if (!isSender && !isReceiver) {
      throw new Error("You do not have permission to reply to this conversation.");
    }

    // Permission enforcement: Sender can only reply if founder accepted Talk More
    if (isSender && reachout.status !== "ACCEPTED") {
      throw new Error(
        "You cannot send more messages until the founder accepts Talk More."
      );
    }

    // If founder is replying and status was PENDING, auto-accept to streamline conversation
    if (isReceiver && reachout.status === "PENDING") {
      await this.messageRepository.updateStatus(reachout.id, "ACCEPTED", dto.senderId);
    }

    const replyId = "reply-" + Math.random().toString(36).substring(2, 9);

    return await this.messageRepository.addReply({
      id: replyId,
      reachoutId: dto.reachoutId,
      senderId: dto.senderId,
      message: dto.message.trim(),
    });
  }

  async markAsRead(messageId: string, userId: string): Promise<boolean> {
    return await this.messageRepository.markAsRead(messageId, userId);
  }
}
