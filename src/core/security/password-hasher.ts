import { IPasswordHasher } from "@/core/interfaces/auth.interface";

export class WebCryptoPasswordHasher implements IPasswordHasher {
  constructor(private readonly salt: string = "pitchery_salt_2026") {}

  async hash(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + this.salt);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async verify(password: string, hash: string): Promise<boolean> {
    const inputHash = await this.hash(password);
    return inputHash === hash;
  }
}

export const defaultPasswordHasher = new WebCryptoPasswordHasher();
