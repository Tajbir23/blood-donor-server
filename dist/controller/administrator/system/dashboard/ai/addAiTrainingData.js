"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aiTrainingSchema_1 = __importDefault(require("../../../../../models/ai/aiTrainingSchema"));
const intentClassifier_1 = require("../../../../../handler/facebookBotHandler/ai/intentClassifier");
const faqKnowledgeBase_1 = require("../../../../../handler/facebookBotHandler/ai/faqKnowledgeBase");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const CUSTOM_FAQ_PATH = path.join(process.cwd(), "ai-model", "custom_faq.json");
function loadCustomFaq() {
    try {
        if (!fs.existsSync(CUSTOM_FAQ_PATH))
            return [];
        return JSON.parse(fs.readFileSync(CUSTOM_FAQ_PATH, "utf-8"));
    }
    catch (_a) {
        return [];
    }
}
const addAiTrainingData = async (req, res) => {
    var _a;
    try {
        const { questionText, answerText, intent, sourceMessageId, sourcePlatform } = req.body;
        const addedBy = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || "admin";
        if (!questionText || !answerText || !intent) {
            res.status(400).json({ success: false, message: "questionText, answerText, intent are required" });
            return;
        }
        // 1. Save to MongoDB
        const entry = await aiTrainingSchema_1.default.create({
            questionText: questionText.trim(),
            answerText: answerText.trim(),
            intent,
            sourceMessageId: sourceMessageId || null,
            sourcePlatform: sourcePlatform || null,
            addedBy,
        });
        // 2. Append to extra_training.json (for NN intent classifier)
        const existing = (0, intentClassifier_1.loadExtraTrainingSamples)();
        existing.push({ text: questionText.trim(), intent });
        (0, intentClassifier_1.saveExtraTrainingSamples)(existing);
        // 3. Append to custom_faq.json (for FAQ answer retrieval)
        const faqList = loadCustomFaq();
        faqList.push({ questionText: questionText.trim(), answerText: answerText.trim() });
        (0, faqKnowledgeBase_1.saveCustomFaqEntries)(faqList);
        // 4. Retrain model in background (non-blocking)
        (0, intentClassifier_1.retrainModel)().catch(err => console.error("[AI Training] Retrain error:", err));
        res.status(201).json({ success: true, message: "Training data added. Model retraining in background.", data: entry });
    }
    catch (error) {
        console.error("[addAiTrainingData]", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.default = addAiTrainingData;
