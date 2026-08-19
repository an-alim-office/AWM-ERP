import type { RiskCheckInput, RiskCheckResult, RiskLevel } from "@/types/identity";
import { loginAttemptManager } from "./LoginAttemptManager";

function scoreToLevel(score: number): RiskLevel {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}

function levelToAction(level: RiskLevel): RiskCheckResult["action"] {
  if (level === "critical" || level === "high") return "deny";
  if (level === "medium") return "challenge";
  return "allow";
}

export class RiskEngine {
  assess(input: RiskCheckInput): RiskCheckResult {
    const reasons: string[] = [];
    let score = 0;

    const recentAttempts = loginAttemptManager.countRecentByIp(input.tenantId, input.ip, 60);
    if (recentAttempts >= 5) {
      score += 35;
      reasons.push("High number of recent login attempts from this IP.");
    }

    if (input.mfaEnabled === false) {
      score += 20;
      reasons.push("MFA is not enabled.");
    }

    if (input.trustedDevice === false) {
      score += 15;
      reasons.push("Device is not trusted.");
    }

    if (!input.userAgent) {
      score += 10;
      reasons.push("User agent is missing.");
    }

    if (input.sessionId && input.deviceId) {
      score = Math.max(0, score - 10);
      reasons.push("Known session and device pairing detected.");
    }

    const level = scoreToLevel(score);

    return {
      level,
      score,
      reasons,
      action: levelToAction(level),
    };
  }
}

export const riskEngine = new RiskEngine();