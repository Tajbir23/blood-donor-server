/**
 * Intent Classifier using TensorFlow.js
 * ─────────────────────────────────────────────────────────────────────────────
 * • Trains a compact Dense neural network at first startup, then saves to disk.
 * • On every subsequent restart the saved model is loaded instantly (no training).
 * • Designed to run comfortably inside 500 MB RAM.
 */

import * as tf from "@tensorflow/tfjs";
import * as path from "path";
import * as fs from "fs";
import { trainingData, INTENTS, Intent } from "./trainingData";
import {
    buildVocabulary,
    getVocabulary,
    textToVector,
    intentToOneHot,
    vectorToIntent,
    confidence,
} from "./textPreprocessor";

// ── Paths ─────────────────────────────────────────────────────────────────────
const MODEL_DIR = path.join(process.cwd(), "ai-model");
const EXTRA_TRAINING_PATH = path.join(MODEL_DIR, "extra_training.json");

// ── Load extra (admin-added) training samples from disk ───────────────────────
export function loadExtraTrainingSamples(): { text: string; intent: Intent }[] {
    try {
        if (!fs.existsSync(EXTRA_TRAINING_PATH)) return [];
        const raw = fs.readFileSync(EXTRA_TRAINING_PATH, "utf-8");
        return JSON.parse(raw) as { text: string; intent: Intent }[];
    } catch {
        return [];
    }
}

/** Save extra training samples to disk (called by admin API controllers). */
export function saveExtraTrainingSamples(samples: { text: string; intent: Intent }[]): void {
    if (!fs.existsSync(MODEL_DIR)) fs.mkdirSync(MODEL_DIR, { recursive: true });
    fs.writeFileSync(EXTRA_TRAINING_PATH, JSON.stringify(samples, null, 2));
}

// ── Model singleton ───────────────────────────────────────────────────────────
let model: tf.LayersModel | null = null;
let isTraining = false;
let isTrained  = false;

const CONFIDENCE_THRESHOLD = 0.45;

// ── Build compact model ───────────────────────────────────────────────────────
function buildModel(inputSize: number): tf.LayersModel {
    const m = tf.sequential();

    m.add(tf.layers.dense({
        inputShape: [inputSize],
        units: 64,                          // 128 → 64  (half the RAM)
        activation: "relu",
        kernelInitializer: "glorotUniform",
    }));
    m.add(tf.layers.dropout({ rate: 0.3 }));

    m.add(tf.layers.dense({
        units: 32,                          // 64 → 32
        activation: "relu",
    }));
    m.add(tf.layers.dropout({ rate: 0.2 }));

    m.add(tf.layers.dense({
        units: INTENTS.length,
        activation: "softmax",
    }));

    m.compile({
        optimizer: tf.train.adam(0.001),
        loss: "categoricalCrossentropy",
        metrics: ["accuracy"],
    });

    return m;
}

// ── Persist / restore helpers (pure-JSON, no native addon required) ──────────

interface SerializedModel {
    topology: object;
    weightSpecs: tf.io.WeightsManifestEntry[];
    weightData: number[][];
    vocab: string[];
}

const ARTIFACT_PATH = path.join(MODEL_DIR, "model_artifact.json");

async function saveModelToDisk(m: tf.LayersModel): Promise<void> {
    let savedArtifacts: tf.io.ModelArtifacts | null = null;

    // Capture the artifacts without using file:// handler
    await m.save(tf.io.withSaveHandler(async (artifacts) => {
        savedArtifacts = artifacts;
        return { modelArtifactsInfo: { dateSaved: new Date(), modelTopologyType: "JSON" } };
    }));

    if (!savedArtifacts) throw new Error("No artifacts captured");
    const a = savedArtifacts as tf.io.ModelArtifacts;

    // Convert binary weight buffer → plain number arrays
    const weights = a.weightSpecs ?? [];
    const buffer  = a.weightData instanceof ArrayBuffer
        ? a.weightData
        : (a.weightData as any).buffer ?? a.weightData;

    let offset = 0;
    const weightData: number[][] = weights.map((spec) => {
        const size = spec.shape.reduce((a: number, b: number) => a * b, 1);
        const arr  = Array.from(new Float32Array(buffer as ArrayBuffer, offset, size));
        offset += size * 4;
        return arr;
    });

    const artifact: SerializedModel = {
        topology: a.modelTopology as object,
        weightSpecs: weights,
        weightData,
        vocab: getVocabulary(),
    };

    if (!fs.existsSync(MODEL_DIR)) fs.mkdirSync(MODEL_DIR, { recursive: true });
    fs.writeFileSync(ARTIFACT_PATH, JSON.stringify(artifact));
    console.log("[AI] Model saved to disk ✓");
}

async function loadSavedModel(): Promise<boolean> {
    if (!fs.existsSync(ARTIFACT_PATH)) return false;
    try {
        const artifact: SerializedModel = JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf-8"));

        // Restore vocabulary
        buildVocabulary(artifact.vocab);

        // Re-pack weight arrays back into an ArrayBuffer
        const totalFloats = artifact.weightData.reduce((s, arr) => s + arr.length, 0);
        const buffer = new ArrayBuffer(totalFloats * 4);
        const view   = new Float32Array(buffer);
        let offset = 0;
        for (const arr of artifact.weightData) {
            view.set(arr, offset);
            offset += arr.length;
        }

        model = await tf.loadLayersModel(
            tf.io.fromMemory(artifact.topology, artifact.weightSpecs, buffer)
        );
        isTrained = true;
        console.log("[AI] Loaded saved model from disk ✓");
        return true;
    } catch (err) {
        console.warn("[AI] Could not load saved model, will retrain:", err);
        // Delete corrupt cache so next start retrains cleanly
        try { fs.unlinkSync(ARTIFACT_PATH); } catch { /* ignore */ }
        return false;
    }
}

// ── Train the model ───────────────────────────────────────────────────────────
export async function trainIntentModel(): Promise<void> {
    if (isTraining || isTrained) return;
    isTraining = true;

    // Try disk cache first
    if (await loadSavedModel()) {
        isTraining = false;
        return;
    }

    try {
        console.log("[AI] Building vocabulary …");
        const extraSamples = loadExtraTrainingSamples();
        const allTrainingSamples = [...trainingData, ...extraSamples];
        buildVocabulary(undefined, allTrainingSamples.map(s => s.text));
        const vocab = getVocabulary();

        console.log("[AI] Preparing training tensors …");
        const shuffled = allTrainingSamples
            .map((s, i) => ({ x: textToVector(s.text), y: intentToOneHot(s.intent) }))
            .sort(() => Math.random() - 0.5);

        const xTensor = tf.tensor2d(shuffled.map(a => a.x));
        const yTensor = tf.tensor2d(shuffled.map(a => a.y));

        console.log(`[AI] Training on ${shuffled.length} samples, vocab=${vocab.length} …`);
        model = buildModel(vocab.length);

        await model.fit(xTensor, yTensor, {
            epochs: 80,                     // 300 → 80  (converges fine, ~⅓ the RAM spike)
            batchSize: 16,                  // 8 → 16  (fewer gradient steps in memory)
            shuffle: true,
            validationSplit: 0.1,
            callbacks: {
                onEpochEnd: (epoch: number, logs?: tf.Logs) => {
                    if ((epoch + 1) % 20 === 0 && logs) {
                        console.log(
                            `[AI] Epoch ${epoch + 1}/80  loss=${logs["loss"]?.toFixed(4)}  acc=${logs["acc"]?.toFixed(4)}`
                        );
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
        if (typeof global.gc === "function") global.gc();

    } catch (err) {
        console.error("[AI] Training error:", err);
        isTraining = false;
        throw err;
    } finally {
        isTraining = false;
    }
}

// ── Predict ───────────────────────────────────────────────────────────────────
export interface Prediction {
    intent: Intent;
    confidence: number;
    scores: Record<Intent, number>;
}

export async function predictIntent(text: string): Promise<Prediction> {
    if (!isTrained || !model) {
        return keywordFallback(text);
    }

    // tf.tidy disposes all intermediate tensors automatically
    const scores = tf.tidy(() => {
        const inputTensor = tf.tensor2d([textToVector(text)]);
        const outputTensor = model!.predict(inputTensor) as tf.Tensor;
        return Array.from(outputTensor.dataSync());
    });

    const intent = vectorToIntent(scores);
    const conf   = confidence(scores);

    const scoreMap = {} as Record<Intent, number>;
    INTENTS.forEach((label, i) => {
        scoreMap[label] = parseFloat((scores[i] ?? 0).toFixed(4));
    });

    return {
        intent: conf >= CONFIDENCE_THRESHOLD ? intent : "UNKNOWN",
        confidence: parseFloat(conf.toFixed(4)),
        scores: scoreMap,
    };
}

/** Quick keyword-based fallback used before/if TF model is ready */
function keywordFallback(text: string): Prediction {
    const lower = text.toLowerCase();

    const dummy = Object.fromEntries(INTENTS.map(k => [k, 0])) as Record<Intent, number>;

    const hit = (keywords: string[]) => keywords.some(k => lower.includes(k));

    if (hit(["রক্ত দরকার","রক্ত চাই","রক্তদাতা","blood needed","need blood",
              "blood donor","find blood","ডোনার দরকার","ডোনার খুঁজছি",
              "রক্ত লাগবে","রক্ত খুঁজছি","blood urgently",
              "a+","b+","o+","ab+","a-","b-","o-","ab-"])) {
        return { intent: "FIND_BLOOD", confidence: 0.8, scores: { ...dummy, FIND_BLOOD: 0.8 } };
    }
    if (hit(["রক্ত দেওয়ার বয়স","কতদিন পর","ট্যাটু","tattoo","eligib",
              "রক্ত দিতে পারব","কতবার","থ্যালাসেমিয়া","thalassemia",
              "ডায়াবেটিস","pregnancy","গর্ভাবস্থা","রক্ত দেওয়ার পর"])) {
        return { intent: "BLOOD_INFO", confidence: 0.8, scores: { ...dummy, BLOOD_INFO: 0.8 } };
    }
    if (hit(["register","donate blood","become donor","রেজিস্ট্রেশন",
              "রক্তদান করতে চাই","ডোনার হতে চাই","নিবন্ধন"])) {
        return { intent: "REGISTER_DONOR", confidence: 0.8, scores: { ...dummy, REGISTER_DONOR: 0.8 } };
    }
    if (hit(["update","donated today","gave blood","আপডেট","রক্ত দিয়েছি"])) {
        return { intent: "UPDATE_DONATION", confidence: 0.8, scores: { ...dummy, UPDATE_DONATION: 0.8 } };
    }
    if (hit(["help","menu","সাহায্য","মেনু"])) {
        return { intent: "HELP", confidence: 0.8, scores: { ...dummy, HELP: 0.8 } };
    }
    if (hit(["hello","hi","hey","হ্যালো","হাই","সালাম"])) {
        return { intent: "GREET", confidence: 0.8, scores: { ...dummy, GREET: 0.8 } };
    }

    return { intent: "UNKNOWN", confidence: 0, scores: dummy };
}

export function isModelReady(): boolean {
    return isTrained;
}

/**
 * Force a full retrain from scratch (called after admin adds/removes training data).
 * Deletes the cached model artifact so the next trainIntentModel() retrains from data.
 */
export async function retrainModel(): Promise<void> {
    // Delete cached artifact so training runs fresh
    try {
        if (fs.existsSync(ARTIFACT_PATH)) fs.unlinkSync(ARTIFACT_PATH);
    } catch { /* ignore */ }

    // Reset model state
    model     = null;
    isTrained = false;
    isTraining = false;

    console.log("[AI] Cache cleared – starting retrain …");
    await trainIntentModel();
}
