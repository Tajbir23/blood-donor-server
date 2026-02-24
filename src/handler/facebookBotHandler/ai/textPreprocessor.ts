/**
 * Text Preprocessor for Bengali and English
 * Builds a shared vocabulary and converts text → numeric vectors
 */

import { trainingData, INTENTS, Intent } from "./trainingData";

// ── vocabulary ────────────────────────────────────────────────────────────────
let vocabulary: string[] = [];

/** Tokenise a single string (Bengali + English friendly) */
export function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .normalize("NFC")                    // normalize Unicode (important for Bengali)
        .replace(/[^\u0980-\u09FF\w\s+\-]/g, " ") // keep Bengali block, word chars, +/-
        .split(/\s+/)
        .filter(t => t.length > 0);
}

/** Build vocabulary from all training samples, or restore from a saved array */
export function buildVocabulary(savedVocab?: string[]): void {
    if (savedVocab && savedVocab.length > 0) {
        vocabulary = savedVocab;
        console.log(`[AI] Vocabulary restored from disk: ${vocabulary.length} tokens`);
        return;
    }
    const wordSet = new Set<string>();
    for (const sample of trainingData) {
        for (const token of tokenize(sample.text)) {
            wordSet.add(token);
        }
    }
    vocabulary = Array.from(wordSet).sort();
    console.log(`[AI] Vocabulary built: ${vocabulary.length} tokens`);
}

/** Return current vocabulary (build first if empty) */
export function getVocabulary(): string[] {
    if (vocabulary.length === 0) buildVocabulary();
    return vocabulary;
}

/**
 * Convert text to a bag-of-words float array
 * Length = vocabulary size
 */
export function textToVector(text: string): number[] {
    const vocab = getVocabulary();
    const tokens = tokenize(text);
    const vector = new Array<number>(vocab.length).fill(0);
    for (const token of tokens) {
        const idx = vocab.indexOf(token);
        if (idx >= 0) vector[idx] = 1;
    }
    return vector;
}

/** One-hot encode an intent label */
export function intentToOneHot(intent: Intent): number[] {
    const vec = new Array<number>(INTENTS.length).fill(0);
    const idx = INTENTS.indexOf(intent);
    if (idx >= 0) vec[idx] = 1;
    return vec;
}

/** Decode a softmax output vector → Intent */
export function vectorToIntent(output: number[]): Intent {
    let maxIdx = 0;
    let maxVal = output[0];
    for (let i = 1; i < output.length; i++) {
        if (output[i] > maxVal) {
            maxVal = output[i];
            maxIdx = i;
        }
    }
    return INTENTS[maxIdx] ?? "UNKNOWN";
}

/** Max confidence value from softmax output */
export function confidence(output: number[]): number {
    return Math.max(...output);
}
