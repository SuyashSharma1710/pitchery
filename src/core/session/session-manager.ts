import { ISessionManager } from "@/core/interfaces/auth.interface";
import { User } from "@/types";
import {
  createSessionToken,
  parseSessionToken,
  getSessionCookie,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/session";

export class CookieSessionManager implements ISessionManager {
  createToken(user: User): string {
    return createSessionToken(user);
  }

  parseToken(token: string): { userId: string; exp: number } | null {
    return parseSessionToken(token);
  }

  async getCookie(): Promise<string | undefined> {
    return await getSessionCookie();
  }

  async setCookie(token: string): Promise<void> {
    await setSessionCookie(token);
  }

  async clearCookie(): Promise<void> {
    await clearSessionCookie();
  }
}

export const defaultSessionManager = new CookieSessionManager();
