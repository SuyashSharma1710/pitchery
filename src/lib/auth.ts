import { authService } from "@/core/container";
import { User } from "@/types";

export async function getCurrentUser(): Promise<User | null> {
  return await authService.getCurrentUser();
}
