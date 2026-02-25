"use strict";
/**
 * Text Preprocessor for Bengali and English
 * Builds a shared vocabulary and converts text → numeric vectors
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenize = tokenize;
exports.buildVocabulary = buildVocabulary;
exports.getVocabulary = getVocabulary;
exports.textToVector = textToVector;
exports.intentToOneHot = intentToOneHot;
exports.vectorToIntent = vectorToIntent;
exports.confidence = confidence;
const trainingData_1 = require("./trainingData");
// ── vocabulary ────────────────────────────────────────────────────────────────
let vocabulary = [];
/** Tokenise a single string (Bengali + English friendly) */
function tokenize(text) {
    return text
        .toLowerCase()
        .normalize("NFC") // normalize Unicode (important for Bengali)
        .replace(/[^\u0980-\u09FF\w\s+\-]/g, " ") // keep Bengali block, word chars, +/-
        .split(/\s+/)
        .filter(t => t.length > 0);
}
/** Build vocabulary from all training samples, or restore from a saved array */
function buildVocabulary(savedVocab) {
    if (savedVocab && savedVocab.length > 0) {
        vocabulary = savedVocab;
        console.log(`[AI] Vocabulary restored from disk: ${vocabulary.length} tokens`);
        return;
    }
    const wordSet = new Set();
    for (const sample of trainingData_1.trainingData) {
        for (const token of tokenize(sample.text)) {
            wordSet.add(token);
        }
    }
    vocabulary = Array.from(wordSet).sort();
    console.log(`[AI] Vocabulary built: ${vocabulary.length} tokens`);
}
/** Return current vocabulary (build first if empty) */
function getVocabulary() {
    if (vocabulary.length === 0)
        buildVocabulary();
    return vocabulary;
}
/**
 * Convert text to a bag-of-words float array
 * Length = vocabulary size
 */
function textToVector(text) {
    const vocab = getVocabulary();
    const tokens = tokenize(text);
    const vector = new Array(vocab.length).fill(0);
    for (const token of tokens) {
        const idx = vocab.indexOf(token);
        if (idx >= 0)
            vector[idx] = 1;
    }
    return vector;
}
/** One-hot encode an intent label */
function intentToOneHot(intent) {
    const vec = new Array(trainingData_1.INTENTS.length).fill(0);
    const idx = trainingData_1.INTENTS.indexOf(intent);
    if (idx >= 0)
        vec[idx] = 1;
    return vec;
}
/** Decode a softmax output vector → Intent */
function vectorToIntent(output) {
    var _a;
    let maxIdx = 0;
    let maxVal = output[0];
    for (let i = 1; i < output.length; i++) {
        if (output[i] > maxVal) {
            maxVal = output[i];
            maxIdx = i;
        }
    }
    return (_a = trainingData_1.INTENTS[maxIdx]) !== null && _a !== void 0 ? _a : "UNKNOWN";
}
/** Max confidence value from softmax output */
function confidence(output) {
    return Math.max(...output);
}
