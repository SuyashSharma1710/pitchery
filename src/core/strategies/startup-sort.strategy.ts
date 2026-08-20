import { Startup } from "@/types";
import { IStartupSortStrategy, StartupSortOption } from "@/core/interfaces/startup.interface";

export class LatestSortStrategy implements IStartupSortStrategy {
  readonly name: StartupSortOption = "latest";

  sort(startups: Startup[]): Startup[] {
    return [...startups].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export class PopularSortStrategy implements IStartupSortStrategy {
  readonly name: StartupSortOption = "popular";

  sort(startups: Startup[]): Startup[] {
    return [...startups].sort((a, b) => (b.views || 0) - (a.views || 0));
  }
}

export class AlphabeticalSortStrategy implements IStartupSortStrategy {
  readonly name: StartupSortOption = "alphabetical";

  sort(startups: Startup[]): Startup[] {
    return [...startups].sort((a, b) => a.title.localeCompare(b.title));
  }
}

/**
 * Startup Sort Registry (Open for extension, closed for modification)
 */
export class StartupSortRegistry {
  private strategies: Map<StartupSortOption, IStartupSortStrategy> = new Map();

  constructor() {
    this.register(new LatestSortStrategy());
    this.register(new PopularSortStrategy());
    this.register(new AlphabeticalSortStrategy());
  }

  register(strategy: IStartupSortStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  get(name: StartupSortOption = "latest"): IStartupSortStrategy {
    return this.strategies.get(name) || this.strategies.get("latest")!;
  }

  sort(startups: Startup[], option: StartupSortOption = "latest"): Startup[] {
    const strategy = this.get(option);
    return strategy.sort(startups);
  }
}

export const defaultSortRegistry = new StartupSortRegistry();
