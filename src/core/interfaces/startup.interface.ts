import { Startup } from "@/types";

export type StartupSortOption = "latest" | "popular" | "alphabetical";

export interface CreateStartupDTO {
  title: string;
  description: string;
  category: string;
  image: string;
  pitch: string;
  authorId: string;
}

export interface UpdateStartupDTO {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  pitch: string;
  authorId: string;
}

export interface StartupFilterDTO {
  query?: string;
  category?: string;
  authorId?: string;
  sortBy?: StartupSortOption;
}

export interface StartupCreateEntity {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  image: string;
  pitch: string;
  views: number;
  authorId: string;
}

export interface StartupUpdateEntity {
  title?: string;
  description?: string;
  category?: string;
  image?: string;
  pitch?: string;
  updatedAt?: Date;
}

/**
 * Data Access Contract for Startups (Repository Pattern)
 */
export interface IStartupRepository {
  findMany(filter?: StartupFilterDTO): Promise<Startup[]>;
  findById(id: string): Promise<Startup | null>;
  findBySlug(slug: string): Promise<Startup | null>;
  findSimilar(category: string, excludeId: string, limit?: number): Promise<Startup[]>;
  create(entity: StartupCreateEntity): Promise<Startup>;
  update(id: string, entity: StartupUpdateEntity): Promise<Startup>;
  delete(id: string): Promise<boolean>;
  incrementViews(id: string): Promise<number>;
}

/**
 * Open-Closed Principle (OCP) Sorting Strategy contract
 */
export interface IStartupSortStrategy {
  name: StartupSortOption;
  sort(startups: Startup[]): Startup[];
}

/**
 * Segregated Read/Query Interface (ISP)
 */
export interface IStartupQueryService {
  getStartups(filter?: StartupFilterDTO): Promise<Startup[]>;
  getStartupById(id: string): Promise<Startup | null>;
  getSimilarStartups(category: string, excludeId: string): Promise<Startup[]>;
}

/**
 * Segregated Write/Command Interface (ISP)
 */
export interface IStartupCommandService {
  createStartup(dto: CreateStartupDTO): Promise<Startup>;
  updateStartup(dto: UpdateStartupDTO): Promise<Startup>;
  deleteStartup(id: string, authorId: string): Promise<boolean>;
  incrementViews(id: string): Promise<number>;
}

/**
 * Composite Startup Service Interface
 */
export interface IStartupService extends IStartupQueryService, IStartupCommandService {}
