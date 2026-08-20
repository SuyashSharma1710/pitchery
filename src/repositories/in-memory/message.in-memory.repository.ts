import { Reachout, ReachoutReply, ReachoutStatus, Startup, User } from "@/types";
import {
  IMessageRepository,
  ReachoutCreateEntity,
} from "@/core/interfaces/message.interface";
import { SAMPLE_STARTUPS, SAMPLE_USERS } from "@/db/sample-data";

const DEFAULT_IN_MEMORY_REACHOUTS: Reachout[] = [
  {
    id: "reachout-1",
    senderId: "user_elena_rostova",
    receiverId: "user_nathan_smith",
    startupId: "startup-6",
    senderName: "Elena Rostova",
    senderEmail: "elena@example.com",
    subject: "Partnership Inquiry for DevFlow Studio",
    message:
      "Hi Nathan, I saw your DevFlow Studio pitch on Pitchery. We are developing asynchronous AI agents at Osmo AI and would love to discuss a potential integration or partnership with your cloud IDE environment. Let me know if you are open to a brief conversation!",
    status: "ACCEPTED",
    isRead: false,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    sender: SAMPLE_USERS[3],
    receiver: SAMPLE_USERS[0],
    startup: SAMPLE_STARTUPS[5],
    replies: [
      {
        id: "reply-1",
        reachoutId: "reachout-1",
        senderId: "user_nathan_smith",
        message: "Hi Elena! Excited to connect. Osmo AI's autonomous dev workflows look impressive. Let's explore how we can integrate an extension inside DevFlow.",
        createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        sender: SAMPLE_USERS[0],
      },
    ],
  },
];

export class InMemoryMessageRepository implements IMessageRepository {
  private reachouts: Reachout[];
  private replies: ReachoutReply[];
  private users: User[];
  private startups: Startup[];

  constructor(
    initialReachouts: Reachout[] = DEFAULT_IN_MEMORY_REACHOUTS,
    initialUsers: User[] = SAMPLE_USERS,
    initialStartups: Startup[] = SAMPLE_STARTUPS
  ) {
    this.reachouts = initialReachouts.map((r) => ({ ...r, replies: r.replies ? [...r.replies] : [] }));
    this.replies = initialReachouts.flatMap((r) => r.replies || []);
    this.users = [...initialUsers];
    this.startups = [...initialStartups];
  }

  private attachRelations(reachout: Reachout): Reachout {
    const sender =
      reachout.sender || this.users.find((u) => u.id === reachout.senderId);
    const receiver =
      reachout.receiver || this.users.find((u) => u.id === reachout.receiverId);
    const startup =
      reachout.startup || this.startups.find((s) => s.id === reachout.startupId);
    const threadReplies = this.replies
      .filter((rep) => rep.reachoutId === reachout.id)
      .map((rep) => ({
        ...rep,
        sender: rep.sender || this.users.find((u) => u.id === rep.senderId),
      }))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return { ...reachout, sender, receiver, startup, replies: threadReplies };
  }

  async findByReceiverId(receiverId: string): Promise<Reachout[]> {
    return this.reachouts
      .filter((m) => m.receiverId === receiverId)
      .map((m) => this.attachRelations(m))
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async findBySenderId(senderId: string): Promise<Reachout[]> {
    return this.reachouts
      .filter((m) => m.senderId === senderId)
      .map((m) => this.attachRelations(m))
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async findById(id: string): Promise<Reachout | null> {
    const found = this.reachouts.find((m) => m.id === id);
    if (!found) return null;
    return this.attachRelations(found);
  }

  async findExistingReachout(senderId: string, startupId: string): Promise<Reachout | null> {
    const found = this.reachouts.find(
      (m) => m.senderId === senderId && m.startupId === startupId
    );
    if (!found) return null;
    return this.attachRelations(found);
  }

  async countUnread(receiverId: string): Promise<number> {
    return this.reachouts.filter(
      (m) => m.receiverId === receiverId && !m.isRead
    ).length;
  }

  async create(entity: ReachoutCreateEntity): Promise<Reachout> {
    const sender = entity.senderId
      ? this.users.find((u) => u.id === entity.senderId)
      : undefined;
    const receiver = this.users.find((u) => u.id === entity.receiverId);
    const startup = entity.startupId
      ? this.startups.find((s) => s.id === entity.startupId)
      : undefined;

    const newReachout: Reachout = {
      id: entity.id,
      senderId: entity.senderId,
      receiverId: entity.receiverId,
      startupId: entity.startupId,
      senderName: entity.senderName.trim(),
      senderEmail: entity.senderEmail.trim(),
      subject: entity.subject.trim(),
      message: entity.message.trim(),
      status: entity.status || "PENDING",
      isRead: entity.isRead,
      createdAt: new Date().toISOString(),
      sender,
      receiver,
      startup,
      replies: [],
    };

    this.reachouts.unshift(newReachout);
    return this.attachRelations(newReachout);
  }

  async updateStatus(id: string, status: ReachoutStatus, receiverId: string): Promise<Reachout | null> {
    const reachout = this.reachouts.find((m) => m.id === id && m.receiverId === receiverId);
    if (!reachout) return null;
    reachout.status = status;
    reachout.updatedAt = new Date().toISOString();
    return this.attachRelations(reachout);
  }

  async addReply(reply: { id: string; reachoutId: string; senderId: string; message: string }): Promise<ReachoutReply> {
    const reachout = this.reachouts.find((m) => m.id === reply.reachoutId);
    if (!reachout) throw new Error("Reachout conversation not found.");

    const sender = this.users.find((u) => u.id === reply.senderId);
    const newReply: ReachoutReply = {
      id: reply.id,
      reachoutId: reply.reachoutId,
      senderId: reply.senderId,
      message: reply.message.trim(),
      createdAt: new Date().toISOString(),
      sender,
    };

    this.replies.push(newReply);
    reachout.updatedAt = newReply.createdAt;
    
    // Mark as unread for the other party
    if (reply.senderId === reachout.senderId) {
      reachout.isRead = false;
    }

    return newReply;
  }

  async markAsRead(messageId: string, userId: string): Promise<boolean> {
    const msg = this.reachouts.find(
      (m) => m.id === messageId && (m.receiverId === userId || m.senderId === userId)
    );
    if (msg) {
      msg.isRead = true;
      return true;
    }
    return false;
  }
}
