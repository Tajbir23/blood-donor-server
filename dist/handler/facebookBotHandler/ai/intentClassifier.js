"use strict";
/**
 * Intent Classifier using TensorFlow.js
 * ─────────────────────────────────────────────────────────────────────────────
 * • Trains a compact Dense neural network at first startup, then saves to disk.
 * • On every subsequent restart the saved model is loaded instantly (no training).
 * • Designed to run comfortably inside 500 MB RAM.
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
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const trainingData_1 = require("./trainingData");
const textPreprocessor_1 = require("./textPreprocessor");
// ── Paths ─────────────────────────────────────────────────────────────────────
const MODEL_DIR = path.join(process.cwd(), "ai-model");
// ── Model singleton ───────────────────────────────────────────────────────────
let model = null;
let isTraining = false;
let isTrained = false;
const CONFIDENCE_THRESHOLD = 0.45;
// ── Build compact model ───────────────────────────────────────────────────────
function buildModel(inputSize) {
    const m = tf.sequential();
    m.add(tf.layers.dense({
        inputShape: [inputSize],
        units: 64, // 128 → 64  (half the RAM)
        activation: "relu",
        kernelInitializer: "glorotUniform",
    }));
    m.add(tf.layers.dropout({ rate: 0.3 }));
    m.add(tf.layers.dense({
        units: 32, // 64 → 32
        activation: "relu",
    }));
    m.add(tf.layers.dropout({ rate: 0.2 }));
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
const ARTIFACT_PATH = path.join(MODEL_DIR, "model_artifact.json");
async function saveModelToDisk(m) {
    var _a, _b;
    let savedArtifacts = null;
    // Capture the artifacts without using file:// handler
    await m.save(tf.io.withSaveHandler(async (artifacts) => {
        savedArtifacts = artifacts;
        return { modelArtifactsInfo: { dateSaved: new Date(), modelTopologyType: "JSON" } };
    }));
    if (!savedArtifacts)
        throw new Error("No artifacts captured");
    const a = savedArtifacts;
    // Convert binary weight buffer → plain number arrays
    const weights = (_a = a.weightSpecs) !== null && _a !== void 0 ? _a : [];
    const buffer = a.weightData instanceof ArrayBuffer
        ? a.weightData
        : (_b = a.weightData.buffer) !== null && _b !== void 0 ? _b : a.weightData;
    let offset = 0;
    const weightData = weights.map((spec) => {
        const size = spec.shape.reduce((a, b) => a * b, 1);
        const arr = Array.from(new Float32Array(buffer, offset, size));
        offset += size * 4;
        return arr;
    });
    const artifact = {
        topology: a.modelTopology,
        weightSpecs: weights,
        weightData,
        vocab: (0, textPreprocessor_1.getVocabulary)(),
    };
    if (!fs.existsSync(MODEL_DIR))
        fs.mkdirSync(MODEL_DIR, { recursive: true });
    fs.writeFileSync(ARTIFACT_PATH, JSON.stringify(artifact));
    console.log("[AI] Model saved to disk ✓");
}
async function loadSavedModel() {
    if (!fs.existsSync(ARTIFACT_PATH))
        return false;
    try {
        const artifact = JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf-8"));
        // Restore vocabulary
        (0, textPreprocessor_1.buildVocabulary)(artifact.vocab);
        // Re-pack weight arrays back into an ArrayBuffer
        const totalFloats = artifact.weightData.reduce((s, arr) => s + arr.length, 0);
        const buffer = new ArrayBuffer(totalFloats * 4);
        const view = new Float32Array(buffer);
        let offset = 0;
        for (const arr of artifact.weightData) {
            view.set(arr, offset);
            offset += arr.length;
        }
        model = await tf.loadLayersModel(tf.io.fromMemory(artifact.topology, artifact.weightSpecs, buffer));
        isTrained = true;
        console.log("[AI] Loaded saved model from disk ✓");
        return true;
    }
    catch (err) {
        console.warn("[AI] Could not load saved model, will retrain:", err);
        // Delete corrupt cache so next start retrains cleanly
        try {
            fs.unlinkSync(ARTIFACT_PATH);
        }
        catch ( /* ignore */_a) { /* ignore */ }
        return false;
    }
}
// ── Train the model ───────────────────────────────────────────────────────────
async function trainIntentModel() {
    if (isTraining || isTrained)
        return;
    isTraining = true;
    // Try disk cache first
    if (await loadSavedModel()) {
        isTraining = false;
        return;
    }
    try {
        console.log("[AI] Building vocabulary …");
        (0, textPreprocessor_1.buildVocabulary)();
        const vocab = (0, textPreprocessor_1.getVocabulary)();
        console.log("[AI] Preparing training tensors …");
        const shuffled = trainingData_1.trainingData
            .map((s, i) => ({ x: (0, textPreprocessor_1.textToVector)(s.text), y: (0, textPreprocessor_1.intentToOneHot)(s.intent) }))
            .sort(() => Math.random() - 0.5);
        const xTensor = tf.tensor2d(shuffled.map(a => a.x));
        const yTensor = tf.tensor2d(shuffled.map(a => a.y));
        console.log(`[AI] Training on ${shuffled.length} samples, vocab=${vocab.length} …`);
        model = buildModel(vocab.length);
        await model.fit(xTensor, yTensor, {
            epochs: 80, // 300 → 80  (converges fine, ~⅓ the RAM spike)
            batchSize: 16, // 8 → 16  (fewer gradient steps in memory)
            shuffle: true,
            validationSplit: 0.1,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    var _a, _b;
                    if ((epoch + 1) % 20 === 0 && logs) {
                        console.log(`[AI] Epoch ${epoch + 1}/80  loss=${(_a = logs["loss"]) === null || _a === void 0 ? void 0 : _a.toFixed(4)}  acc=${(_b = logs["acc"]) === null || _b === void 0 ? void 0 : _b.toFixed(4)}`);
                    }
                },
            },
        });
        xTensor.dispose();
        yTensor.dispose();
        // Save to disk so next restart skips training entirely
        await saveModelToDisk(model);
        isTrained = true;
        console.log("[AI] Intent model training complete ✓");
        // Suggest GC after the big allocation
        if (typeof global.gc === "function")
            global.gc();
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
        return keywordFallback(text);
    }
    // tf.tidy disposes all intermediate tensors automatically
    const scores = tf.tidy(() => {
        const inputTensor = tf.tensor2d([(0, textPreprocessor_1.textToVector)(text)]);
        const outputTensor = model.predict(inputTensor);
        return Array.from(outputTensor.dataSync());
    });
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
    const dummy = Object.fromEntries(trainingData_1.INTENTS.map(k => [k, 0]));
    const hit = (keywords) => keywords.some(k => lower.includes(k));
    if (hit(["রক্ত দরকার", "রক্ত চাই", "রক্তদাতা", "blood needed", "need blood",
        "blood donor", "find blood", "ডোনার দরকার", "ডোনার খুঁজছি",
        "রক্ত লাগবে", "রক্ত খুঁজছি", "blood urgently",
        "a+", "b+", "o+", "ab+", "a-", "b-", "o-", "ab-"])) {
        return { intent: "FIND_BLOOD", confidence: 0.8, scores: { ...dummy, FIND_BLOOD: 0.8 } };
    }
    if (hit(["রক্ত দেওয়ার বয়স", "কতদিন পর", "ট্যাটু", "tattoo", "eligib",
        "রক্ত দিতে পারব", "কতবার", "থ্যালাসেমিয়া", "thalassemia",
        "ডায়াবেটিস", "pregnancy", "গর্ভাবস্থা", "রক্ত দেওয়ার পর"])) {
        return { intent: "BLOOD_INFO", confidence: 0.8, scores: { ...dummy, BLOOD_INFO: 0.8 } };
    }
    if (hit(["register", "donate blood", "become donor", "রেজিস্ট্রেশন",
        "রক্তদান করতে চাই", "ডোনার হতে চাই", "নিবন্ধন"])) {
        return { intent: "REGISTER_DONOR", confidence: 0.8, scores: { ...dummy, REGISTER_DONOR: 0.8 } };
    }
    if (hit(["update", "donated today", "gave blood", "আপডেট", "রক্ত দিয়েছি"])) {
        return { intent: "UPDATE_DONATION", confidence: 0.8, scores: { ...dummy, UPDATE_DONATION: 0.8 } };
    }
    if (hit(["help", "menu", "সাহায্য", "মেনু"])) {
        return { intent: "HELP", confidence: 0.8, scores: { ...dummy, HELP: 0.8 } };
    }
    if (hit(["hello", "hi", "hey", "হ্যালো", "হাই", "সালাম"])) {
        return { intent: "GREET", confidence: 0.8, scores: { ...dummy, GREET: 0.8 } };
    }
    return { intent: "UNKNOWN", confidence: 0, scores: dummy };
}
function isModelReady() {
    return isTrained;
}
