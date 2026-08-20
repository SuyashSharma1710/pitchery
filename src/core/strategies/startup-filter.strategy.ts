import { Startup } from "@/types";

export interface IStartupFilterPredicate {
  matches(startup: Startup): boolean;
}

export class CategoryFilterPredicate implements IStartupFilterPredicate {
  constructor(private readonly category: string) {}

  matches(startup: Startup): boolean {
    if (!this.category || this.category.toLowerCase() === "all") return true;
    const catLower = this.category.toLowerCase();
    return (
      startup.category.toLowerCase().includes(catLower) ||
      startup.title.toLowerCase().includes(catLower) ||
      startup.description.toLowerCase().includes(catLower) ||
      startup.pitch.toLowerCase().includes(catLower)
    );
  }
}

export class QueryFilterPredicate implements IStartupFilterPredicate {
  constructor(private readonly query: string) {}

  matches(startup: Startup): boolean {
    if (!this.query.trim()) return true;
    const q = this.query.toLowerCase().trim();
    return (
      startup.title.toLowerCase().includes(q) ||
      startup.description.toLowerCase().includes(q) ||
      startup.category.toLowerCase().includes(q) ||
      startup.pitch.toLowerCase().includes(q) ||
      Boolean(startup.author?.name.toLowerCase().includes(q)) ||
      Boolean(startup.author?.username.toLowerCase().includes(q))
    );
  }
}

export class AuthorFilterPredicate implements IStartupFilterPredicate {
  constructor(private readonly authorId: string) {}

  matches(startup: Startup): boolean {
    if (!this.authorId) return true;
    return startup.authorId === this.authorId;
  }
}

/**
 * Composite Filter Engine (Open for extension)
 */
export class StartupFilterEngine {
  static filter(startups: Startup[], predicates: IStartupFilterPredicate[]): Startup[] {
    return startups.filter((startup) =>
      predicates.every((predicate) => predicate.matches(startup))
    );
  }
}
