import { db } from "@/db";
import * as schema from "@/db/schema";
import { Startup } from "@/types";
import {
  IStartupRepository,
  StartupCreateEntity,
  StartupFilterDTO,
  StartupUpdateEntity,
} from "@/core/interfaces/startup.interface";
import { desc, asc, eq, ilike, or, and, ne } from "drizzle-orm";

export class DrizzleStartupRepository implements IStartupRepository {
  private get database() {
    if (!db) throw new Error("Database client is not initialized.");
    return db;
  }

  async findMany(filter: StartupFilterDTO = {}): Promise<Startup[]> {
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
        const userRows = await this.database
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, row.authorId))
          .limit(1);

        return {
          ...row,
          author: userRows[0] || undefined,
        };
      })
    );

    return startupsWithAuthors;
  }

  async findById(id: string): Promise<Startup | null> {
    const rows = await this.database
      .select()
      .from(schema.startups)
      .where(or(eq(schema.startups.id, id), eq(schema.startups.slug, id)))
      .limit(1);

    if (rows.length === 0) return null;

    const userRows = await this.database
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, rows[0].authorId))
      .limit(1);

    return {
      ...rows[0],
      author: userRows[0] || undefined,
    };
  }

  async findBySlug(slug: string): Promise<Startup | null> {
    return this.findById(slug);
  }

  async findSimilar(category: string, excludeId: string, limit: number = 4): Promise<Startup[]> {
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
        const userRows = await this.database
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, r.authorId))
          .limit(1);
        return { ...r, author: userRows[0] || undefined };
      })
    );
  }

  async create(entity: StartupCreateEntity): Promise<Startup> {
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
  }

  async update(id: string, entity: StartupUpdateEntity): Promise<Startup> {
    const [updated] = await this.database
      .update(schema.startups)
      .set({
        ...entity,
        updatedAt: new Date(),
      })
      .where(eq(schema.startups.id, id))
      .returning();

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await this.database.delete(schema.startups).where(eq(schema.startups.id, id));
    return true;
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
      console.warn("Neon DB view increment warning:", err);
    }
    return 0;
  }
}
