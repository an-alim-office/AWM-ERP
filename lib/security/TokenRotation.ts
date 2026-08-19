import { hashValue, randomToken } from "./Hashing";

export interface RotatingTokenPair {
  current: string;
  previous?: string;
  currentHash: string;
  previousHash?: string;
  rotatedAt: Date;
}

export function rotateToken(existing?: RotatingTokenPair): RotatingTokenPair {
  const current = randomToken(32);
  const currentHash = hashValue(current);

  if (!existing) {
    return { current, currentHash, rotatedAt: new Date() };
  }

  return {
    current,
    currentHash,
    previous: existing.current,
    previousHash: existing.currentHash,
    rotatedAt: new Date(),
  };
}