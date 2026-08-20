import { Startup } from "@/types";
import {
  IStartupService,
  CreateStartupDTO,
  UpdateStartupDTO,
  StartupFilterDTO,
  IStartupRepository,
} from "@/core/interfaces/startup.interface";
import { slugify } from "@/lib/utils";

export class StartupService implements IStartupService {
  constructor(private readonly startupRepository: IStartupRepository) {}

  async getStartups(filter: StartupFilterDTO = {}): Promise<Startup[]> {
    return await this.startupRepository.findMany(filter);
  }

  async getStartupById(id: string): Promise<Startup | null> {
    return await this.startupRepository.findById(id);
  }

  async getSimilarStartups(category: string, excludeId: string): Promise<Startup[]> {
    return await this.startupRepository.findSimilar(category, excludeId);
  }

  async createStartup(dto: CreateStartupDTO): Promise<Startup> {
    const baseSlug = slugify(dto.title);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;
    const startupId = "startup-" + Math.random().toString(36).substring(2, 9);

    return await this.startupRepository.create({
      id: startupId,
      title: dto.title.trim(),
      slug,
      description: dto.description.trim(),
      category: dto.category.trim(),
      image: dto.image.trim(),
      pitch: dto.pitch.trim(),
      views: 0,
      authorId: dto.authorId,
    });
  }

  async updateStartup(dto: UpdateStartupDTO): Promise<Startup> {
    const existing = await this.startupRepository.findById(dto.id);
    if (!existing) {
      throw new Error("Pitch not found.");
    }
    if (existing.authorId !== dto.authorId) {
      throw new Error("Unauthorized. You can only edit your own pitches.");
    }

    return await this.startupRepository.update(dto.id, {
      title: dto.title.trim(),
      description: dto.description.trim(),
      category: dto.category.trim(),
      image: dto.image.trim(),
      pitch: dto.pitch.trim(),
    });
  }

  async deleteStartup(id: string, authorId: string): Promise<boolean> {
    const existing = await this.startupRepository.findById(id);
    if (!existing) {
      throw new Error("Pitch not found.");
    }
    if (existing.authorId !== authorId) {
      throw new Error("Unauthorized. You can only delete your own pitches.");
    }

    return await this.startupRepository.delete(id);
  }

  async incrementViews(id: string): Promise<number> {
    return await this.startupRepository.incrementViews(id);
  }
}
