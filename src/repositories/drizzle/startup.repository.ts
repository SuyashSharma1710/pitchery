import { db } from "@/db";
import * as schema from "@/db/schema";
import { Startup } from "@/types";
import {
  IStartupRepository,
  StartupCreateEntity,
  StartupFilterDTO,
  StartupUpdateEntity,
} from "@/core/interfaces/startup.interface";
import { InMemoryStartupRepository } from "@/repositories/in-memory/startup.in-memory.repository";
import { desc, asc, eq, ilike, or, and, ne } from "drizzle-orm";

export class DrizzleStartupRepository implements IStartupRepository {
  constructor(private readonly inMemory: IStartupRepository = new InMemoryStartupRepository()) {}

  private get database() {
    if (!db) throw new Error("Database client is not initialized.");
    return db;
  }

  async findMany(filter: StartupFilterDTO = {}): Promise<Startup[]> {
    try {
      const { query = "", category = "", authorId = "", sortBy = "latest" } = filter;
      const conditions = [];

      if (category && category !== "All") {
        conditions.push(ilike(schema.startups.category, `%${category}%`));
      }
      if (authorId) {
        conditions.push(eq(schema.startups.authorId, authorId));
      }
      if (query) {
        conditions.push(
          or(
            ilike(schema.startups.title, `%${query}%`),
            ilike(schema.startups.description, `%${query}%`),
            ilike(schema.startups.category, `%${query}%`)
          )
        );
      }

      let orderClause = desc(schema.startups.createdAt);
      if (sortBy === "popular") {
        orderClause = desc(schema.startups.views);
      } else if (sortBy === "alphabetical") {
        orderClause = asc(schema.startups.title);
      }

      const rows = await this.database
        .select()
        .from(schema.startups)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(orderClause);

      // Populate authors
      const startupsWithAuthors = await Promise.all(
        rows.map(async (row) => {
          try {
            const userRows = await this.database
              .select()
              .from(schema.users)
              .where(eq(schema.users.id, row.authorId))
              .limit(1);

            return {
              ...row,
              author: userRows[0] || undefined,
            };
          } catch {
            return row;
          }
        })
      );

      return startupsWithAuthors;
    } catch (err) {
      console.warn("⚠️ Neon DB findMany error (falling back to in-memory):", err);
      return this.inMemory.findMany(filter);
    }
  }

  async findById(id: string): Promise<Startup | null> {
    try {
      const rows = await this.database
        .select()
        .from(schema.startups)
        .where(or(eq(schema.startups.id, id), eq(schema.startups.slug, id)))
        .limit(1);

      if (rows.length === 0) return null;

      try {
        const userRows = await this.database
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, rows[0].authorId))
          .limit(1);

        return {
          ...rows[0],
          author: userRows[0] || undefined,
        };
      } catch {
        return rows[0];
      }
    } catch (err) {
      console.warn("⚠️ Neon DB findById error (falling back to in-memory):", err);
      return this.inMemory.findById(id);
    }
  }

  async findBySlug(slug: string): Promise<Startup | null> {
    return this.findById(slug);
  }

  async findSimilar(category: string, excludeId: string, limit: number = 4): Promise<Startup[]> {
    try {
      const rows = await this.database
        .select()
        .from(schema.startups)
        .where(
          and(
            ilike(schema.startups.category, `%${category}%`),
            ne(schema.startups.id, excludeId)
          )
        )
        .limit(limit);

      return await Promise.all(
        rows.map(async (r) => {
          try {
            const userRows = await this.database
              .select()
              .from(schema.users)
              .where(eq(schema.users.id, r.authorId))
              .limit(1);
            return { ...r, author: userRows[0] || undefined };
          } catch {
            return r;
          }
        })
      );
    } catch (err) {
      console.warn("⚠️ Neon DB findSimilar error (falling back to in-memory):", err);
      return this.inMemory.findSimilar(category, excludeId, limit);
    }
  }

  async create(entity: StartupCreateEntity): Promise<Startup> {
    try {
      const [inserted] = await this.database
        .insert(schema.startups)
        .values({
          id: entity.id,
          title: entity.title.trim(),
          slug: entity.slug,
          description: entity.description.trim(),
          category: entity.category.trim(),
          image: entity.image.trim(),
          pitch: entity.pitch.trim(),
          views: entity.views,
          authorId: entity.authorId,
        })
        .returning();

      return inserted;
    } catch (err) {
      console.warn("⚠️ Neon DB create startup error (falling back to in-memory):", err);
      return this.inMemory.create(entity);
    }
  }

  async update(id: string, entity: StartupUpdateEntity): Promise<Startup> {
    try {
      const [updated] = await this.database
        .update(schema.startups)
        .set({
          ...entity,
          updatedAt: new Date(),
        })
        .where(eq(schema.startups.id, id))
        .returning();

      return updated;
    } catch (err) {
      console.warn("⚠️ Neon DB update startup error (falling back to in-memory):", err);
      return this.inMemory.update(id, entity);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.database.delete(schema.startups).where(eq(schema.startups.id, id));
      return true;
    } catch (err) {
      console.warn("⚠️ Neon DB delete startup error (falling back to in-memory):", err);
      return this.inMemory.delete(id);
    }
  }

  async incrementViews(id: string): Promise<number> {
    try {
      const rows = await this.database
        .select({ views: schema.startups.views })
        .from(schema.startups)
        .where(eq(schema.startups.id, id))
        .limit(1);

      if (rows.length > 0) {
        const newViews = rows[0].views + 1;
        await this.database
          .update(schema.startups)
          .set({ views: newViews })
          .where(eq(schema.startups.id, id));
        return newViews;
      }
    } catch (err) {
      console.warn("⚠️ Neon DB view increment error (falling back to in-memory):", err);
      return this.inMemory.incrementViews(id);
    }
    return 0;
  }
}
