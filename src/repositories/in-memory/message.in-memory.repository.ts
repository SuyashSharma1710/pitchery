import { Reachout, Startup, User } from "@/types";
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
    isRead: false,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    sender: SAMPLE_USERS[3],
    startup: SAMPLE_STARTUPS[5],
  },
];

export class InMemoryMessageRepository implements IMessageRepository {
  private reachouts: Reachout[];
  private users: User[];
  private startups: Startup[];

  constructor(
    initialReachouts: Reachout[] = DEFAULT_IN_MEMORY_REACHOUTS,
    initialUsers: User[] = SAMPLE_USERS,
    initialStartups: Startup[] = SAMPLE_STARTUPS
  ) {
    this.reachouts = [...initialReachouts];
    this.users = [...initialUsers];
    this.startups = [...initialStartups];
  }

  private attachRelations(reachout: Reachout): Reachout {
    const sender =
      reachout.sender || this.users.find((u) => u.id === reachout.senderId);
    const startup =
      reachout.startup || this.startups.find((s) => s.id === reachout.startupId);
    return { ...reachout, sender, startup };
  }

  async findByReceiverId(receiverId: string): Promise<Reachout[]> {
    return this.reachouts
      .filter((m) => m.receiverId === receiverId)
      .map((m) => this.attachRelations(m))
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
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
      isRead: entity.isRead,
      createdAt: new Date().toISOString(),
      sender,
      startup,
    };

    this.reachouts.unshift(newReachout);
    return this.attachRelations(newReachout);
  }

  async markAsRead(messageId: string, receiverId: string): Promise<boolean> {
    const msg = this.reachouts.find(
      (m) => m.id === messageId && m.receiverId === receiverId
    );
    if (msg) {
      msg.isRead = true;
      return true;
    }
    return false;
  }
}
