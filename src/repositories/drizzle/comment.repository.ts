import { db } from "@/db";
import * as schema from "@/db/schema";
import { Comment } from "@/types";
import {
  ICommentRepository,
  CommentCreateEntity,
} from "@/core/interfaces/comment.interface";
import { InMemoryCommentRepository } from "@/repositories/in-memory/comment.in-memory.repository";
import { desc, eq } from "drizzle-orm";

export class DrizzleCommentRepository implements ICommentRepository {
  constructor(private readonly inMemory: ICommentRepository = new InMemoryCommentRepository()) {}

  private get database() {
    if (!db) throw new Error("Database client is not initialized.");
    return db;
  }

  async findByStartupId(startupId: string): Promise<Comment[]> {
    try {
      const rows = await this.database
        .select()
        .from(schema.comments)
        .where(eq(schema.comments.startupId, startupId))
        .orderBy(desc(schema.comments.createdAt));

      const commentsWithUsers = await Promise.all(
        rows.map(async (row) => {
          try {
            const userRows = await this.database
              .select()
              .from(schema.users)
              .where(eq(schema.users.id, row.userId))
              .limit(1);

            return {
              ...row,
              user: userRows[0] || undefined,
            };
          } catch {
            return row;
          }
        })
      );

      return commentsWithUsers;
    } catch (err) {
      console.warn("⚠️ Neon DB findByStartupId error (falling back to in-memory):", err);
      return this.inMemory.findByStartupId(startupId);
    }
  }

  async findById(id: string): Promise<Comment | null> {
    try {
      const rows = await this.database
        .select()
        .from(schema.comments)
        .where(eq(schema.comments.id, id))
        .limit(1);

      if (rows.length === 0) return null;

      try {
        const userRows = await this.database
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, rows[0].userId))
          .limit(1);

        return {
          ...rows[0],
          user: userRows[0] || undefined,
        };
      } catch {
        return rows[0];
      }
    } catch (err) {
      console.warn("⚠️ Neon DB findById error (falling back to in-memory):", err);
      return this.inMemory.findById(id);
    }
  }

  async create(entity: CommentCreateEntity): Promise<Comment> {
    try {
      const [inserted] = await this.database
        .insert(schema.comments)
        .values({
          id: entity.id,
          startupId: entity.startupId,
          userId: entity.userId,
          content: entity.content.trim(),
        })
        .returning();

      let user = undefined;
      try {
        const userRows = await this.database
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, entity.userId))
          .limit(1);
        user = userRows[0] || undefined;
      } catch {
        // user optional
      }

      return {
        ...inserted,
        user,
      };
    } catch (err) {
      console.warn("⚠️ Neon DB create comment error (falling back to in-memory):", err);
      return this.inMemory.create(entity);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.database.delete(schema.comments).where(eq(schema.comments.id, id));
      return true;
    } catch (err) {
      console.warn("⚠️ Neon DB delete comment error (falling back to in-memory):", err);
      return this.inMemory.delete(id);
    }
  }
}
