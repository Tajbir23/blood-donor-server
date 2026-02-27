/**
 * customRuleChecker.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Loads custom bot rules from MongoDB and checks incoming messages against them.
 * Cache is refreshed every 5 minutes (or immediately when a rule is changed via dashboard).
 */

import BotCustomRuleModel, { IBotCustomRule, Platform } from "../../../models/ai/botCustomRuleSchema";

let _cache: IBotCustomRule[] | null = null;
let _cacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function invalidateCustomRuleCache(): void {
    _cache = null;
    _cacheTime = 0;
}

async function loadRules(): Promise<IBotCustomRule[]> {
    if (_cache && Date.now() - _cacheTime < CACHE_TTL_MS) return _cache;
    try {
        const rules = await BotCustomRuleModel.find({ isActive: true }).sort({ createdAt: 1 }).lean() as unknown as IBotCustomRule[];
        _cache = rules;
        _cacheTime = Date.now();
        return rules;
    } catch (err) {
        console.error("[customRuleChecker] DB load error:", err);
        return _cache || [];
    }
}

function matchesTrigger(rule: IBotCustomRule, text: string): boolean {
    const t   = text.trim().toLowerCase();
    const trg = rule.trigger.trim().toLowerCase();

    switch (rule.matchType) {
        case "exact":      return t === trg;
        case "startsWith": return t.startsWith(trg);
        case "regex": {
            try {
                return new RegExp(rule.trigger, "i").test(text);
            } catch {
                return false;
            }
        }
        case "contains":
        default:
            return t.includes(trg);
    }
}

/**
 * Returns the first matching custom rule response, or null.
 * @param text     The raw user message
 * @param platform "telegram" | "facebook"
 */
export async function checkCustomRule(text: string, platform: Platform): Promise<string | null> {
    const rules = await loadRules();
    for (const rule of rules) {
        if (rule.platform !== "all" && rule.platform !== platform) continue;
        if (matchesTrigger(rule, text)) {
            return rule.response;
        }
    }
    return null;
}
