/**
 * Entity Extractor for Facebook Bot AI
 * Extracts blood group, location, bag count and urgency from Bengali / English text.
 * Works entirely locally – no API keys required.
 */

import { bangladeshGeoData } from "../../../utils/bangladeshGeoLoactionData";

// ── Types ────────────────────────────────────────────────────────────────────
export interface LocationEntity {
    id: string;
    name: string;
    latitude: string;
    longitude: string;
    type: "division" | "district" | "thana";
    divisionId?: string;
    districtId?: string;
}

export interface ExtractedEntities {
    bloodGroup: string | null;       // e.g. "A+", "B-", etc.
    location: LocationEntity | null;
    rawLocation: string | null;      // original mention
    bagCount: number | null;         // e.g. 2 from "২ ব্যাগ"
    isUrgent: boolean;               // true if urgency keywords detected
}

// ── Hospital → location mapping ───────────────────────────────────────────────
/**
 * Well-known hospitals/institutions mapped to the nearest thana id.
 * Expanded over time as needed.
 */
const HOSPITAL_LOCATION_MAP: Record<string, string> = {
    // Dhaka
    "ঢাকা মেডিকেল":          "motijheel",
    "dhaka medical":          "motijheel",
    "dmch":                   "motijheel",
    "বঙ্গবন্ধু শেখ মুজিব":    "ramna",
    "bsmmu":                  "ramna",
    "বিএসএমএমইউ":             "ramna",
    "স্যার সলিমুল্লাহ":       "motijheel",
    "mitford":                "motijheel",
    "শিশু হাসপাতাল":          "ramna",
    "national heart":         "ramna",
    "জাতীয় হৃদরোগ":          "ramna",
    "গুলশান":                 "gulshan",
    "united hospital":        "gulshan",
    "ইউনাইটেড হাসপাতাল":      "gulshan",
    "বারডেম":                 "ramna",
    "birdem":                 "ramna",
    "square hospital":        "mohammadpur",
    "স্কয়ার হাসপাতাল":        "mohammadpur",
    "ibnsina":                "dhanmondi",
    "ইবনে সিনা":              "dhanmondi",
    "labaid":                 "dhanmondi",
    "ল্যাবএইড":               "dhanmondi",
    "popular hospital":       "dhanmondi",
    "পপুলার হাসপাতাল":        "dhanmondi",
    // Chittagong
    "চট্টগ্রাম মেডিকেল":      "chittagong_city",
    "cmch":                   "chittagong_city",
    "chittagong medical":     "chittagong_city",
    "মা ও শিশু":              "chittagong_city",
    "mother and child":       "chittagong_city",
    // Rajshahi
    "রাজশাহী মেডিকেল":        "rajshahi_city",
    "rajshahi medical":       "rajshahi_city",
    "rmch":                   "rajshahi_city",
    // Sylhet
    "সিলেট এমএজি ওসমানী":     "sylhet_sadar",
    "osmani":                 "sylhet_sadar",
    "sylhet medical":         "sylhet_sadar",
    // Mymensingh
    "ময়মনসিংহ মেডিকেল":       "mymensingh_sadar",
    "mmch":                   "mymensingh_sadar",
    // Rangpur
    "রংপুর মেডিকেল":          "rangpur_sadar",
    "rangpur medical":        "rangpur_sadar",
    "rmc":                    "rangpur_sadar",
    // Barisal
    "বরিশাল শের-ই-বাংলা":     "barisal_sadar",
    "sher-e-bangla medical":  "barisal_sadar",
    // Comilla
    "কুমিল্লা মেডিকেল":       "barisal_sadar",
    "comilla medical":        "barisal_sadar",
};

/**
 * Try to resolve a hospital name from the text to a thana id.
 */
export function extractHospitalLocation(text: string): string | null {
    const lower = text.toLowerCase().normalize("NFC");
    for (const [key, thanaId] of Object.entries(HOSPITAL_LOCATION_MAP)) {
        if (lower.includes(key.toLowerCase())) return thanaId;
    }
    return null;
}

// ── Bag count extraction ──────────────────────────────────────────────────────
const BENGALI_DIGITS: Record<string, number> = {
    "এক": 1, "দুই": 2, "তিন": 3, "চার": 4, "পাঁচ": 5,
    "এক ব্যাগ": 1, "দুই ব্যাগ": 2, "তিন ব্যাগ": 3,
    "১": 1, "২": 2, "৩": 3, "৪": 4, "৫": 5,
};

export function extractBagCount(text: string): number | null {
    const lower = text.toLowerCase().normalize("NFC");

    // Bengali digit + ব্যাগ  e.g. "২ ব্যাগ"
    for (const [word, value] of Object.entries(BENGALI_DIGITS)) {
        const pattern = new RegExp(word + "\\s*(ব্যাগ|bag|unit|ইউনিট|পিস|bottle)", "i");
        if (pattern.test(lower)) return value;
    }
    // English digit + bag/unit  e.g. "2 bags"
    const m = lower.match(/(\d+)\s*(bag|unit|bottle|pint)/i);
    if (m) return parseInt(m[1], 10);

    return null;
}

// ── Urgency detection ─────────────────────────────────────────────────────────
const URGENCY_KEYWORDS = [
    "জরুরি", "অতি জরুরি", "urgent", "emergency", "আজকে", "এখনই", "এখন",
    "আজ", "রাতে", "সকালে", "দ্রুত", "asap", "তাড়াতাড়ি", "শীঘ্র",
];

export function detectUrgency(text: string): boolean {
    const lower = text.toLowerCase().normalize("NFC");
    return URGENCY_KEYWORDS.some(k => lower.includes(k));
}

// ── Blood group maps ─────────────────────────────────────────────────────────

/** All possible blood group strings (normalised) */
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

/**
 * Multi-pattern map: each key is a canonical blood group,
 * values are patterns that should match that group (Bengali + English).
 */
const BLOOD_GROUP_PATTERNS: Record<string, RegExp> = {
    "AB+": /\bAB\s*\+|এবি\s*পজিটিভ|ab\s*positive\b/i,
    "AB-": /\bAB\s*-|এবি\s*নেগেটিভ|ab\s*negative\b/i,
    "A+":  /\bA\s*\+(?!B)|এ\s*পজিটিভ(?!\s*বি)|a\s*positive\b(?!\s*b)/i,
    "A-":  /\bA\s*-(?!B)|এ\s*নেগেটিভ(?!\s*বি)|a\s*negative\b(?!\s*b)/i,
    "B+":  /\bB\s*\+|বি\s*পজিটিভ|b\s*positive\b/i,
    "B-":  /\bB\s*-|বি\s*নেগেটিভ|b\s*negative\b/i,
    "O+":  /\bO\s*\+|ও\s*পজিটিভ|o\s*positive\b/i,
    "O-":  /\bO\s*-|ও\s*নেগেটিভ|o\s*negative\b/i,
};

export function extractBloodGroup(text: string): string | null {
    // Try AB first to avoid A/B ambiguity
    for (const group of BLOOD_GROUPS) {
        const pattern = BLOOD_GROUP_PATTERNS[group];
        if (pattern && pattern.test(text)) return group;
    }
    return null;
}

// ── Location index (built once at startup) ────────────────────────────────────

interface LocationIndex {
    // Maps normalised name / transliteration patterns → LocationEntity
    entries: Array<{ patterns: string[]; entity: LocationEntity }>;
}

let locationIndex: LocationIndex | null = null;

/** English transliteration lookup for common Bengali place names */
const TRANSLITERATIONS: Record<string, string[]> = {
    "ঢাকা":            ["dhaka", "dacca"],
    "চট্টগ্রাম":        ["chittagong", "chattagram", "ctg"],
    "সিলেট":           ["sylhet"],
    "রাজশাহী":         ["rajshahi"],
    "খুলনা":           ["khulna"],
    "বরিশাল":          ["barisal", "barishal"],
    "রংপুর":           ["rangpur"],
    "ময়মনসিংহ":        ["mymensingh"],
    "ধানমন্ডি":        ["dhanmondi"],
    "গুলশান":          ["gulshan"],
    "মিরপুর":          ["mirpur"],
    "উত্তরা":          ["uttara"],
    "মোহাম্মদপুর":     ["mohammadpur"],
    "বনানী":           ["banani"],
    "বাড্ডা":          ["badda"],
    "মতিঝিল":         ["motijheel", "motijhil"],
    "পল্টন":           ["palton", "paltan"],
    "রমনা":            ["ramna"],
    "তেজগাঁও":         ["tejgaon"],
    "আদাবর":           ["adabor"],
    "গাজীপুর":         ["gazipur"],
    "নারায়ণগঞ্জ":      ["narayanganj"],
    "কক্সবাজার":       ["coxs bazar", "cox's bazar", "coxsbazar"],
    "দিনাজপুর":        ["dinajpur"],
    "কুমিল্লা":        ["comilla", "cumilla"],
    "ফরিদপুর":         ["faridpur"],
    "যশোর":            ["jessore", "jashore"],
    "সাতক্ষীরা":       ["satkhira"],
    "বান্দরবান":       ["bandarban", "bandarban"],
    "রাঙ্গামাটি":      ["rangamati", "rangamati"],
};

function buildLocationIndex(): LocationIndex {
    const entries: LocationIndex["entries"] = [];

    for (const division of bangladeshGeoData.divisions) {
        const divPatterns = [division.name.toLowerCase(), division.id];
        const divTrans = TRANSLITERATIONS[division.name] || [];
        divPatterns.push(...divTrans);

        entries.push({
            patterns: divPatterns,
            entity: {
                id: division.id,
                name: division.name,
                latitude: "0",
                longitude: "0",
                type: "division",
            },
        });

        for (const district of division.districts) {
            const distPatterns = [district.name.toLowerCase(), district.id];
            const distTrans = TRANSLITERATIONS[district.name] || [];
            distPatterns.push(...distTrans);

            entries.push({
                patterns: distPatterns,
                entity: {
                    id: district.id,
                    name: district.name,
                    latitude: "0",
                    longitude: "0",
                    type: "district",
                    divisionId: division.id,
                },
            });

            for (const thana of district.thanas) {
                const thanaPatterns = [thana.name.toLowerCase(), thana.id.replace(/_/g, " ")];
                const thanaTrans = TRANSLITERATIONS[thana.name] || [];
                thanaPatterns.push(...thanaTrans);

                entries.push({
                    patterns: thanaPatterns,
                    entity: {
                        id: thana.id,
                        name: thana.name,
                        latitude: thana.latitude,
                        longitude: thana.longitude,
                        type: "thana",
                        divisionId: division.id,
                        districtId: district.id,
                    },
                });
            }
        }
    }

    return { entries };
}

function getLocationIndex(): LocationIndex {
    if (!locationIndex) locationIndex = buildLocationIndex();
    return locationIndex;
}

// ── Character overlap scoring (0-1) ─────────────────────────────────────────
function charOverlapScore(a: string, b: string): number {
    if (a.length === 0 || b.length === 0) return 0;
    const longer  = a.length >= b.length ? a : b;
    const shorter = a.length <  b.length ? a : b;
    const used = new Array(longer.length).fill(false);
    let matches = 0;
    for (const ch of shorter) {
        const idx = longer.split("").findIndex((c, i) => c === ch && !used[i]);
        if (idx !== -1) { matches++; used[idx] = true; }
    }
    return matches / longer.length;
}

/** Remove all whitespace for space-agnostic matching ("রাজার হাট" === "রাজারহাট") */
function noSpace(s: string): string {
    return s.replace(/\s+/g, "");
}

/**
 * Fuzzy-search the location index and return the top `limit` closest matches.
 * Scoring priority (high → low):
 *   1. Exact match (space-normalized)  → 1.0
 *   2. Input is prefix of pattern       → 0.92
 *   3. Pattern is prefix of input       → 0.87
 *   4. Substring (original)            → 0.78
 *   5. Space-stripped substring         → 0.72
 *   6. Token-level ratio match          → 0.5–0.85
 *   7. Character overlap                → 0.3–0.6
 */
export function suggestLocations(text: string, limit = 5): LocationEntity[] {
    const cleaned      = text.toLowerCase().normalize("NFC").trim();
    const cleanedNS    = noSpace(cleaned);   // no-space version
    const inputTokens  = cleaned.split(/[\s,।\-_]+/).filter(t => t.length >= 2);
    if (inputTokens.length === 0 && cleanedNS.length < 2) return [];

    const index = getLocationIndex();
    const scored: { entity: LocationEntity; score: number }[] = [];

    for (const entry of index.entries) {
        let bestScore = 0;
        for (const pattern of entry.patterns) {
            const p   = pattern.toLowerCase();
            const pNS = noSpace(p);
            if (p.length < 2) continue;

            // 1. Exact (space-normalized)
            if (cleaned === p || (cleanedNS.length >= 2 && cleanedNS === pNS)) {
                bestScore = 1.0; break;
            }
            // 2. Input is prefix of pattern ("রাজার" → "রাজারহাট")
            if (cleanedNS.length >= 2 && pNS.startsWith(cleanedNS)) {
                const ratio = cleanedNS.length / pNS.length;
                bestScore = Math.max(bestScore, 0.7 + ratio * 0.22);
                continue;
            }
            // 3. Pattern is prefix of input ("ঢাকা" matches "ঢাকামেট্রো")
            if (pNS.length >= 2 && cleanedNS.startsWith(pNS)) {
                const ratio = pNS.length / cleanedNS.length;
                bestScore = Math.max(bestScore, 0.65 + ratio * 0.22);
                continue;
            }
            // 4. Substring (original with spaces)
            if (cleaned.includes(p) || p.includes(cleaned)) {
                bestScore = Math.max(bestScore, 0.78);
                continue;
            }
            // 5. Space-stripped substring
            if (cleanedNS.length >= 2 && (cleanedNS.includes(pNS) || pNS.includes(cleanedNS))) {
                const ratio = Math.min(cleanedNS.length, pNS.length) / Math.max(cleanedNS.length, pNS.length);
                bestScore = Math.max(bestScore, 0.5 + ratio * 0.22);
                continue;
            }
            // 6. Token-level matching
            for (const token of inputTokens) {
                if (token.length < 2) continue;
                const tNS = noSpace(token);
                if (pNS.includes(tNS) || tNS.includes(pNS)) {
                    const ratio = Math.min(tNS.length, pNS.length) / Math.max(tNS.length, pNS.length);
                    bestScore = Math.max(bestScore, 0.42 + ratio * 0.35);
                } else {
                    // 7. Character overlap
                    const ov = charOverlapScore(token, p);
                    if (ov >= 0.68) bestScore = Math.max(bestScore, ov * 0.58);
                }
            }
        }
        if (bestScore >= 0.38) scored.push({ entity: entry.entity, score: bestScore });
    }

    // Sort: higher score first; among equal scores prefer thana > district > division
    scored.sort((a, b) => {
        if (Math.abs(a.score - b.score) > 0.05) return b.score - a.score;
        const order = { thana: 0, district: 1, division: 2 } as const;
        return order[a.entity.type] - order[b.entity.type];
    });

    // Deduplicate by id
    const seen = new Set<string>();
    const results: LocationEntity[] = [];
    for (const { entity } of scored) {
        if (!seen.has(entity.id)) {
            seen.add(entity.id);
            results.push(entity);
            if (results.length >= limit) break;
        }
    }
    return results;
}

/**
 * Look up a location entity by its exact ID string.
 */
export function findLocationById(id: string): LocationEntity | null {
    const index = getLocationIndex();
    const entry = index.entries.find(e => e.entity.id === id);
    return entry?.entity ?? null;
}

/**
 * Find ALL locations whose name exactly matches the given name (case/space-insensitive).
 * Used to detect ambiguity — e.g. "রাজারহাট" exists in Gazipur AND Kurigram.
 * Returns only thanas (most specific) unless none found, then districts.
 */
export function findAllByName(name: string): LocationEntity[] {
    const index = getLocationIndex();
    const cleaned = name.toLowerCase().normalize("NFC").replace(/\s+/g, "");

    const thanas   = index.entries.filter(e =>
        e.entity.type === "thana" &&
        e.entity.name.toLowerCase().normalize("NFC").replace(/\s+/g, "") === cleaned
    ).map(e => e.entity);

    if (thanas.length > 0) return thanas;

    return index.entries.filter(e =>
        e.entity.type === "district" &&
        e.entity.name.toLowerCase().normalize("NFC").replace(/\s+/g, "") === cleaned
    ).map(e => e.entity);
}


/**
 * Extract the best-matching location from free-form text.
 * Prefers more-specific matches (thana > district > division).
 */
export function extractLocation(text: string): { entity: LocationEntity | null; rawMatch: string | null } {
    const lower = text.toLowerCase().normalize("NFC");
    const index = getLocationIndex();

    // Sort: thanas first (most specific), then districts, then divisions
    const prioritised = [...index.entries].sort((a, b) => {
        const order = { thana: 0, district: 1, division: 2 };
        return order[a.entity.type] - order[b.entity.type];
    });

    for (const entry of prioritised) {
        for (const pattern of entry.patterns) {
            const p = pattern.toLowerCase();
            if (p.length < 3) continue; // skip tiny tokens
            if (lower.includes(p)) {
                return { entity: entry.entity, rawMatch: p };
            }
        }
    }

    return { entity: null, rawMatch: null };
}

// ── Main extraction function ──────────────────────────────────────────────────

export function extractEntities(text: string): ExtractedEntities {
    const bloodGroup = extractBloodGroup(text);
    const bagCount = extractBagCount(text);
    const isUrgent = detectUrgency(text);

    // Try geo location first; fallback to hospital name lookup
    let { entity: location, rawMatch: rawLocation } = extractLocation(text);

    if (!location) {
        const thanaId = extractHospitalLocation(text);
        if (thanaId) {
            // Find the thana entity from geo data
            for (const division of bangladeshGeoData.divisions) {
                for (const district of division.districts) {
                    const thana = district.thanas.find(t => t.id === thanaId);
                    if (thana) {
                        location = {
                            id: thana.id,
                            name: thana.name,
                            latitude: thana.latitude,
                            longitude: thana.longitude,
                            type: "thana",
                            divisionId: division.id,
                            districtId: district.id,
                        };
                        rawLocation = thana.name;
                        break;
                    }
                }
                if (location) break;
            }
        }
    }

    return { bloodGroup, location, rawLocation, bagCount, isUrgent };
}

/**
 * Find a thana by its ID, returning its coordinates.
 * Used when location was identified from geo data.
 */
export function getThanaCoordinates(thanaId: string): { latitude: string; longitude: string } | null {
    for (const division of bangladeshGeoData.divisions) {
        for (const district of division.districts) {
            const thana = district.thanas.find(t => t.id === thanaId);
            if (thana) return { latitude: thana.latitude, longitude: thana.longitude };
        }
    }
    return null;
}

/**
 * Returns the centre coordinates of a district (average of its thanas).
 */
export function getDistrictCoordinates(districtId: string): { latitude: string; longitude: string } | null {
    for (const division of bangladeshGeoData.divisions) {
        const district = division.districts.find(d => d.id === districtId);
        if (district) {
            const validThanas = district.thanas.filter(t => t.latitude !== "0");
            if (validThanas.length === 0) return null;
            const avgLat = validThanas.reduce((s, t) => s + parseFloat(t.latitude), 0) / validThanas.length;
            const avgLon = validThanas.reduce((s, t) => s + parseFloat(t.longitude), 0) / validThanas.length;
            return { latitude: avgLat.toFixed(4), longitude: avgLon.toFixed(4) };
        }
    }
    return null;
}

/**
 * Returns the centre coordinates of a division (average of its districts' thanas).
 */
export function getDivisionCoordinates(divisionId: string): { latitude: string; longitude: string } | null {
    const division = bangladeshGeoData.divisions.find(d => d.id === divisionId);
    if (!division) return null;
    const coords: { lat: number; lon: number }[] = [];
    for (const district of division.districts) {
        for (const thana of district.thanas) {
            if (thana.latitude !== "0") {
                coords.push({ lat: parseFloat(thana.latitude), lon: parseFloat(thana.longitude) });
            }
        }
    }
    if (coords.length === 0) return null;
    const avgLat = coords.reduce((s, c) => s + c.lat, 0) / coords.length;
    const avgLon = coords.reduce((s, c) => s + c.lon, 0) / coords.length;
    return { latitude: avgLat.toFixed(4), longitude: avgLon.toFixed(4) };
}
