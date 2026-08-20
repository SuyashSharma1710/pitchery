import { db } from "@/db";
import * as schema from "@/db/schema";
import { Reachout } from "@/types";
import {
  IMessageRepository,
  ReachoutCreateEntity,
} from "@/core/interfaces/message.interface";
import { desc, eq, and } from "drizzle-orm";

export class DrizzleMessageRepository implements IMessageRepository {
  private get database() {
    if (!db) throw new Error("Database client is not initialized.");
    return db;
  }

  async findByReceiverId(receiverId: string): Promise<Reachout[]> {
    const rows = await this.database
      .select()
      .from(schema.reachouts)
      .where(eq(schema.reachouts.receiverId, receiverId))
      .orderBy(desc(schema.reachouts.createdAt));

    const messagesWithDetails = await Promise.all(
      rows.map(async (row) => {
        let senderUser = undefined;
        let startupItem = undefined;

        if (row.senderId) {
          const userRows = await this.database
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, row.senderId))
            .limit(1);
          senderUser = userRows[0] || undefined;
        }

        if (row.startupId) {
          const startupRows = await this.database
            .select()
            .from(schema.startups)
            .where(eq(schema.startups.id, row.startupId))
            .limit(1);
          startupItem = startupRows[0] || undefined;
        }

        return {
          ...row,
          sender: senderUser,
          startup: startupItem,
        };
      })
    );

    return messagesWithDetails;
  }

  async countUnread(receiverId: string): Promise<number> {
    const rows = await this.database
      .select({ id: schema.reachouts.id })
      .from(schema.reachouts)
      .where(
        and(
          eq(schema.reachouts.receiverId, receiverId),
          eq(schema.reachouts.isRead, false)
        )
      );

    return rows.length;
  }

  async create(entity: ReachoutCreateEntity): Promise<Reachout> {
    const [inserted] = await this.database
      .insert(schema.reachouts)
      .values({
        id: entity.id,
        senderId: entity.senderId,
        receiverId: entity.receiverId,
        startupId: entity.startupId,
        senderName: entity.senderName.trim(),
        senderEmail: entity.senderEmail.trim(),
        subject: entity.subject.trim(),
        message: entity.message.trim(),
        isRead: entity.isRead,
      })
      .returning();

    return inserted;
  }

  async markAsRead(messageId: string, receiverId: string): Promise<boolean> {
    await this.database
      .update(schema.reachouts)
      .set({ isRead: true })
      .where(
        and(
          eq(schema.reachouts.id, messageId),
          eq(schema.reachouts.receiverId, receiverId)
        )
      );

    return true;
  }
}
