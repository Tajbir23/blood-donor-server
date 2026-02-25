"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aiTrainingSchema_1 = __importDefault(require("../../../../../models/ai/aiTrainingSchema"));
const intentClassifier_1 = require("../../../../../handler/facebookBotHandler/ai/intentClassifier");
const faqKnowledgeBase_1 = require("../../../../../handler/facebookBotHandler/ai/faqKnowledgeBase");
const deleteAiTrainingData = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ success: false, message: "Training entry ID is required" });
            return;
        }
        const deleted = await aiTrainingSchema_1.default.findByIdAndDelete(id);
        if (!deleted) {
            res.status(404).json({ success: false, message: "Training entry not found" });
            return;
        }
        // Rebuild extra_training.json from remaining DB entries
        const remaining = await aiTrainingSchema_1.default.find({}).lean();
        (0, intentClassifier_1.saveExtraTrainingSamples)(remaining.map(e => ({ text: e.questionText, intent: e.intent })));
        // Rebuild custom_faq.json from remaining DB entries
        (0, faqKnowledgeBase_1.saveCustomFaqEntries)(remaining.map(e => ({ questionText: e.questionText, answerText: e.answerText })));
        // Retrain model in background
        (0, intentClassifier_1.retrainModel)().catch(err => console.error("[AI Training] Retrain error:", err));
        res.status(200).json({ success: true, message: "Training entry deleted. Model retraining in background." });
    }
    catch (error) {
        console.error("[deleteAiTrainingData]", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.default = deleteAiTrainingData;
