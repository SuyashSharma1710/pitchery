import { db } from "@/db";
import * as schema from "@/db/schema";
import { Reachout, ReachoutReply, ReachoutStatus } from "@/types";
import {
  IMessageRepository,
  ReachoutCreateEntity,
} from "@/core/interfaces/message.interface";
import { InMemoryMessageRepository } from "@/repositories/in-memory/message.in-memory.repository";
import { desc, asc, eq, and, or } from "drizzle-orm";

export class DrizzleMessageRepository implements IMessageRepository {
  constructor(private readonly inMemory: IMessageRepository = new InMemoryMessageRepository()) {}

  private get database() {
    if (!db) throw new Error("Database client is not initialized.");
    return db;
  }

  private async populateRelations(rows: (typeof schema.reachouts.$inferSelect)[]): Promise<Reachout[]> {
    return await Promise.all(
      rows.map(async (row) => {
        let senderUser = undefined;
        let receiverUser = undefined;
        let startupItem = undefined;
        let threadReplies: ReachoutReply[] = [];

        try {
          if (row.senderId) {
            const userRows = await this.database
              .select()
              .from(schema.users)
              .where(eq(schema.users.id, row.senderId))
              .limit(1);
            senderUser = userRows[0] || undefined;
          }

          if (row.receiverId) {
            const userRows = await this.database
              .select()
              .from(schema.users)
              .where(eq(schema.users.id, row.receiverId))
              .limit(1);
            receiverUser = userRows[0] || undefined;
          }

          if (row.startupId) {
            const startupRows = await this.database
              .select()
              .from(schema.startups)
              .where(eq(schema.startups.id, row.startupId))
              .limit(1);
            startupItem = startupRows[0] || undefined;
          }

          const replyRows = await this.database
            .select()
            .from(schema.reachoutReplies)
            .where(eq(schema.reachoutReplies.reachoutId, row.id))
            .orderBy(asc(schema.reachoutReplies.createdAt));

          threadReplies = await Promise.all(
            replyRows.map(async (rep) => {
              let repSender = undefined;
              try {
                const repUserRows = await this.database
                  .select()
                  .from(schema.users)
                  .where(eq(schema.users.id, rep.senderId))
                  .limit(1);
                repSender = repUserRows[0] || undefined;
              } catch {
                // ignore
              }
              return {
                ...rep,
                sender: repSender,
              };
            })
          );
        } catch {
          // Ignore subquery failures
        }

        return {
          ...row,
          status: (row.status as ReachoutStatus) || "PENDING",
          sender: senderUser,
          receiver: receiverUser,
          startup: startupItem,
          replies: threadReplies,
        };
      })
    );
  }

  async findByReceiverId(receiverId: string): Promise<Reachout[]> {
    try {
      const rows = await this.database
        .select()
        .from(schema.reachouts)
        .where(eq(schema.reachouts.receiverId, receiverId))
        .orderBy(desc(schema.reachouts.createdAt));

      return await this.populateRelations(rows);
    } catch (err) {
      console.warn("⚠️ Neon DB findByReceiverId error (falling back to in-memory):", err);
      return this.inMemory.findByReceiverId(receiverId);
    }
  }

  async findBySenderId(senderId: string): Promise<Reachout[]> {
    try {
      const rows = await this.database
        .select()
        .from(schema.reachouts)
        .where(eq(schema.reachouts.senderId, senderId))
        .orderBy(desc(schema.reachouts.createdAt));

      return await this.populateRelations(rows);
    } catch (err) {
      console.warn("⚠️ Neon DB findBySenderId error (falling back to in-memory):", err);
      return this.inMemory.findBySenderId(senderId);
    }
  }

  async findById(id: string): Promise<Reachout | null> {
    try {
      const rows = await this.database
        .select()
        .from(schema.reachouts)
        .where(eq(schema.reachouts.id, id))
        .limit(1);

      if (rows.length === 0) return null;
      const results = await this.populateRelations(rows);
      return results[0] || null;
    } catch (err) {
      console.warn("⚠️ Neon DB findById error (falling back to in-memory):", err);
      return this.inMemory.findById(id);
    }
  }

  async findExistingReachout(senderId: string, startupId: string): Promise<Reachout | null> {
    try {
      const rows = await this.database
        .select()
        .from(schema.reachouts)
        .where(
          and(
            eq(schema.reachouts.senderId, senderId),
            eq(schema.reachouts.startupId, startupId)
          )
        )
        .limit(1);

      if (rows.length === 0) return null;
      const results = await this.populateRelations(rows);
      return results[0] || null;
    } catch (err) {
      console.warn("⚠️ Neon DB findExistingReachout error (falling back to in-memory):", err);
      return this.inMemory.findExistingReachout(senderId, startupId);
    }
  }

  async countUnread(receiverId: string): Promise<number> {
    try {
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
    } catch (err) {
      console.warn("⚠️ Neon DB countUnread error (falling back to in-memory):", err);
      return this.inMemory.countUnread(receiverId);
    }
  }

  async create(entity: ReachoutCreateEntity): Promise<Reachout> {
    try {
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
          status: entity.status || "PENDING",
          isRead: entity.isRead,
        })
        .returning();

      return {
        ...inserted,
        status: (inserted.status as ReachoutStatus) || "PENDING",
        replies: [],
      };
    } catch (err) {
      console.warn("⚠️ Neon DB create reachout error (falling back to in-memory):", err);
      return this.inMemory.create(entity);
    }
  }

  async updateStatus(id: string, status: ReachoutStatus, receiverId: string): Promise<Reachout | null> {
    try {
      const [updated] = await this.database
        .update(schema.reachouts)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.reachouts.id, id),
            eq(schema.reachouts.receiverId, receiverId)
          )
        )
        .returning();

      if (!updated) return null;
      const results = await this.populateRelations([updated]);
      return results[0] || null;
    } catch (err) {
      console.warn("⚠️ Neon DB updateStatus error (falling back to in-memory):", err);
      return this.inMemory.updateStatus(id, status, receiverId);
    }
  }

  async addReply(reply: { id: string; reachoutId: string; senderId: string; message: string }): Promise<ReachoutReply> {
    try {
      const [inserted] = await this.database
        .insert(schema.reachoutReplies)
        .values({
          id: reply.id,
          reachoutId: reply.reachoutId,
          senderId: reply.senderId,
          message: reply.message.trim(),
        })
        .returning();

      // Update reachout timestamp & toggle isRead
      await this.database
        .update(schema.reachouts)
        .set({
          updatedAt: new Date(),
          isRead: false,
        })
        .where(eq(schema.reachouts.id, reply.reachoutId));

      let senderUser = undefined;
      try {
        const userRows = await this.database
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, reply.senderId))
          .limit(1);
        senderUser = userRows[0] || undefined;
      } catch {
        // ignore
      }

      return {
        ...inserted,
        sender: senderUser,
      };
    } catch (err) {
      console.warn("⚠️ Neon DB addReply error (falling back to in-memory):", err);
      return this.inMemory.addReply(reply);
    }
  }

  async markAsRead(messageId: string, userId: string): Promise<boolean> {
    try {
      await this.database
        .update(schema.reachouts)
        .set({ isRead: true })
        .where(
          and(
            eq(schema.reachouts.id, messageId),
            or(
              eq(schema.reachouts.receiverId, userId),
              eq(schema.reachouts.senderId, userId)
            )
          )
        );

      return true;
    } catch (err) {
      console.warn("⚠️ Neon DB markAsRead error (falling back to in-memory):", err);
      return this.inMemory.markAsRead(messageId, userId);
    }
  }
}
