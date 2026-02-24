"use strict";
/**
 * Intent Classifier using TensorFlow.js
 * Trains a small Dense neural network at server startup.
 * No external API keys required – runs fully locally.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainIntentModel = trainIntentModel;
exports.predictIntent = predictIntent;
exports.isModelReady = isModelReady;
const tf = __importStar(require("@tensorflow/tfjs"));
const trainingData_1 = require("./trainingData");
const textPreprocessor_1 = require("./textPreprocessor");
// ── Model singleton ───────────────────────────────────────────────────────────
let model = null;
let isTraining = false;
let isTrained = false;
const CONFIDENCE_THRESHOLD = 0.45; // below this → UNKNOWN
// ── Build model architecture ──────────────────────────────────────────────────
function buildModel(inputSize) {
    const m = tf.sequential();
    // Layer 1
    m.add(tf.layers.dense({
        inputShape: [inputSize],
        units: 128,
        activation: "relu",
        kernelInitializer: "glorotUniform",
    }));
    m.add(tf.layers.dropout({ rate: 0.4 }));
    // Layer 2
    m.add(tf.layers.dense({
        units: 64,
        activation: "relu",
    }));
    m.add(tf.layers.dropout({ rate: 0.3 }));
    // Output
    m.add(tf.layers.dense({
        units: trainingData_1.INTENTS.length,
        activation: "softmax",
    }));
    m.compile({
        optimizer: tf.train.adam(0.001),
        loss: "categoricalCrossentropy",
        metrics: ["accuracy"],
    });
    return m;
}
// ── Train the model ───────────────────────────────────────────────────────────
async function trainIntentModel() {
    if (isTraining || isTrained)
        return;
    isTraining = true;
    try {
        console.log("[AI] Building vocabulary …");
        (0, textPreprocessor_1.buildVocabulary)();
        const vocab = (0, textPreprocessor_1.getVocabulary)();
        console.log("[AI] Preparing training tensors …");
        const xs = trainingData_1.trainingData.map(s => (0, textPreprocessor_1.textToVector)(s.text));
        const ys = trainingData_1.trainingData.map(s => (0, textPreprocessor_1.intentToOneHot)(s.intent));
        // Data augmentation: shuffle copies
        const augmented = [...xs.map((x, i) => ({ x, y: ys[i] }))];
        augmented.sort(() => Math.random() - 0.5); // shuffle
        const xTensor = tf.tensor2d(augmented.map(a => a.x));
        const yTensor = tf.tensor2d(augmented.map(a => a.y));
        console.log(`[AI] Training on ${augmented.length} samples, vocab=${vocab.length} …`);
        model = buildModel(vocab.length);
        await model.fit(xTensor, yTensor, {
            epochs: 300,
            batchSize: 8,
            shuffle: true,
            validationSplit: 0.1,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    var _a, _b;
                    if ((epoch + 1) % 50 === 0 && logs) {
                        console.log(`[AI] Epoch ${epoch + 1}/300  loss=${(_a = logs["loss"]) === null || _a === void 0 ? void 0 : _a.toFixed(4)}  acc=${(_b = logs["acc"]) === null || _b === void 0 ? void 0 : _b.toFixed(4)}`);
                    }
                },
            },
        });
        xTensor.dispose();
        yTensor.dispose();
        isTrained = true;
        console.log("[AI] Intent model training complete ✓");
    }
    catch (err) {
        console.error("[AI] Training error:", err);
        isTraining = false;
        throw err;
    }
    finally {
        isTraining = false;
    }
}
async function predictIntent(text) {
    if (!isTrained || !model) {
        // Fallback: keyword-based classification while model trains
        return keywordFallback(text);
    }
    const vector = (0, textPreprocessor_1.textToVector)(text);
    const inputTensor = tf.tensor2d([vector]);
    const outputTensor = model.predict(inputTensor);
    const outputArray = (await outputTensor.data());
    inputTensor.dispose();
    outputTensor.dispose();
    const scores = Array.from(outputArray);
    const intent = (0, textPreprocessor_1.vectorToIntent)(scores);
    const conf = (0, textPreprocessor_1.confidence)(scores);
    const scoreMap = {};
    trainingData_1.INTENTS.forEach((label, i) => {
        var _a;
        scoreMap[label] = parseFloat(((_a = scores[i]) !== null && _a !== void 0 ? _a : 0).toFixed(4));
    });
    return {
        intent: conf >= CONFIDENCE_THRESHOLD ? intent : "UNKNOWN",
        confidence: parseFloat(conf.toFixed(4)),
        scores: scoreMap,
    };
}
/** Quick keyword-based fallback used before/if TF model is ready */
function keywordFallback(text) {
    const lower = text.toLowerCase();
    const findBloodKeywords = [
        "রক্ত দরকার", "রক্ত চাই", "রক্তদাতা", "blood needed", "need blood",
        "blood donor", "find blood", "ডোনার দরকার", "ডোনার খুঁজছি",
        "রক্ত লাগবে", "রক্ত খুঁজছি", "blood urgently", "a+", "b+", "o+", "ab+",
        "a-", "b-", "o-", "ab-",
    ];
    const registerKeywords = [
        "register", "donate blood", "become donor", "রেজিস্ট্রেশন",
        "রক্তদান করতে চাই", "ডোনার হতে চাই", "নিবন্ধন",
    ];
    const updateKeywords = [
        "update", "donated today", "gave blood", "আপডেট", "রক্ত দিয়েছি",
    ];
    const helpKeywords = ["help", "menu", "সাহায্য", "মেনু"];
    const greetKeywords = ["hello", "hi", "hey", "হ্যালো", "হাই", "সালাম"];
    const dummy = { FIND_BLOOD: 0, REGISTER_DONOR: 0, UPDATE_DONATION: 0, REQUEST_BLOOD: 0, GREET: 0, HELP: 0, UNKNOWN: 0 };
    if (findBloodKeywords.some(k => lower.includes(k))) {
        return { intent: "FIND_BLOOD", confidence: 0.8, scores: { ...dummy, FIND_BLOOD: 0.8 } };
    }
    if (registerKeywords.some(k => lower.includes(k))) {
        return { intent: "REGISTER_DONOR", confidence: 0.8, scores: { ...dummy, REGISTER_DONOR: 0.8 } };
    }
    if (updateKeywords.some(k => lower.includes(k))) {
        return { intent: "UPDATE_DONATION", confidence: 0.8, scores: { ...dummy, UPDATE_DONATION: 0.8 } };
    }
    if (helpKeywords.some(k => lower.includes(k))) {
        return { intent: "HELP", confidence: 0.8, scores: { ...dummy, HELP: 0.8 } };
    }
    if (greetKeywords.some(k => lower.includes(k))) {
        return { intent: "GREET", confidence: 0.8, scores: { ...dummy, GREET: 0.8 } };
    }
    return { intent: "UNKNOWN", confidence: 0, scores: dummy };
}
function isModelReady() {
    return isTrained;
}
