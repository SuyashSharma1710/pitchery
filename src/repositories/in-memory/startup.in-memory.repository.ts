import { Startup, User } from "@/types";
import {
  IStartupRepository,
  StartupCreateEntity,
  StartupFilterDTO,
  StartupUpdateEntity,
} from "@/core/interfaces/startup.interface";
import { SAMPLE_STARTUPS, SAMPLE_USERS } from "@/db/sample-data";
import { defaultSortRegistry } from "@/core/strategies/startup-sort.strategy";
import {
  AuthorFilterPredicate,
  CategoryFilterPredicate,
  QueryFilterPredicate,
  StartupFilterEngine,
} from "@/core/strategies/startup-filter.strategy";

export class InMemoryStartupRepository implements IStartupRepository {
  private startups: Startup[];
  private users: User[];

  constructor(initialStartups: Startup[] = SAMPLE_STARTUPS, initialUsers: User[] = SAMPLE_USERS) {
    this.startups = [...initialStartups];
    this.users = [...initialUsers];
  }

  private attachAuthor(startup: Startup): Startup {
    const author = this.users.find((u) => u.id === startup.authorId);
    return { ...startup, author };
  }

  async findMany(filter: StartupFilterDTO = {}): Promise<Startup[]> {
    const { query = "", category = "", authorId = "", sortBy = "latest" } = filter;

    const predicates = [
      new CategoryFilterPredicate(category),
      new QueryFilterPredicate(query),
      new AuthorFilterPredicate(authorId),
    ];

    let result = StartupFilterEngine.filter(this.startups, predicates);
    result = defaultSortRegistry.sort(result, sortBy);

    return result.map((item) => this.attachAuthor(item));
  }

  async findById(id: string): Promise<Startup | null> {
    const found = this.startups.find((s) => s.id === id || s.slug === id);
    if (!found) return null;
    return this.attachAuthor(found);
  }

  async findBySlug(slug: string): Promise<Startup | null> {
    return this.findById(slug);
  }

  async findSimilar(category: string, excludeId: string, limit: number = 4): Promise<Startup[]> {
    const catLower = category.toLowerCase();
    const similar = this.startups
      .filter((s) => s.id !== excludeId && s.category.toLowerCase().includes(catLower))
      .slice(0, limit);

    return similar.map((item) => this.attachAuthor(item));
  }

  async create(entity: StartupCreateEntity): Promise<Startup> {
    const newStartup: Startup = {
      id: entity.id,
      title: entity.title.trim(),
      slug: entity.slug,
      description: entity.description.trim(),
      category: entity.category.trim(),
      image: entity.image.trim(),
      pitch: entity.pitch.trim(),
      views: entity.views,
      authorId: entity.authorId,
      createdAt: new Date().toISOString(),
    };

    this.startups.unshift(newStartup);
    return this.attachAuthor(newStartup);
  }

  async update(id: string, entity: StartupUpdateEntity): Promise<Startup> {
    const index = this.startups.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Pitch not found.");

    const current = this.startups[index];
    const updated: Startup = {
      ...current,
      ...(entity.title !== undefined ? { title: entity.title.trim() } : {}),
      ...(entity.description !== undefined ? { description: entity.description.trim() } : {}),
      ...(entity.category !== undefined ? { category: entity.category.trim() } : {}),
      ...(entity.image !== undefined ? { image: entity.image.trim() } : {}),
      ...(entity.pitch !== undefined ? { pitch: entity.pitch.trim() } : {}),
      updatedAt: new Date().toISOString(),
    };

    this.startups[index] = updated;
    return this.attachAuthor(updated);
  }

  async delete(id: string): Promise<boolean> {
    const index = this.startups.findIndex((s) => s.id === id);
    if (index === -1) return false;
    this.startups.splice(index, 1);
    return true;
  }

  async incrementViews(id: string): Promise<number> {
    const startup = this.startups.find((s) => s.id === id);
    if (startup) {
      startup.views = (startup.views || 0) + 1;
      return startup.views;
    }
    return 0;
  }
}
