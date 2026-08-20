import { db } from "@/db";
import * as schema from "@/db/schema";
import { Comment } from "@/types";
import {
  ICommentRepository,
  CommentCreateEntity,
} from "@/core/interfaces/comment.interface";
import { desc, eq } from "drizzle-orm";

export class DrizzleCommentRepository implements ICommentRepository {
  private get database() {
    if (!db) throw new Error("Database client is not initialized.");
    return db;
  }

  async findByStartupId(startupId: string): Promise<Comment[]> {
    const rows = await this.database
      .select()
      .from(schema.comments)
      .where(eq(schema.comments.startupId, startupId))
      .orderBy(desc(schema.comments.createdAt));

    const commentsWithUsers = await Promise.all(
      rows.map(async (row) => {
        const userRows = await this.database
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, row.userId))
          .limit(1);

        return {
          ...row,
          user: userRows[0] || undefined,
        };
      })
    );

    return commentsWithUsers;
  }

  async findById(id: string): Promise<Comment | null> {
    const rows = await this.database
      .select()
      .from(schema.comments)
      .where(eq(schema.comments.id, id))
      .limit(1);

    if (rows.length === 0) return null;

    const userRows = await this.database
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, rows[0].userId))
      .limit(1);

    return {
      ...rows[0],
      user: userRows[0] || undefined,
    };
  }

  async create(entity: CommentCreateEntity): Promise<Comment> {
    const [inserted] = await this.database
      .insert(schema.comments)
      .values({
        id: entity.id,
        startupId: entity.startupId,
        userId: entity.userId,
        content: entity.content.trim(),
      })
      .returning();

    const userRows = await this.database
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, entity.userId))
      .limit(1);

    return {
      ...inserted,
      user: userRows[0] || undefined,
    };
  }

  async delete(id: string): Promise<boolean> {
    await this.database.delete(schema.comments).where(eq(schema.comments.id, id));
    return true;
  }
}
