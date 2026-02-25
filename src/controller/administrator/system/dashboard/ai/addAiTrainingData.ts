import { Request, Response } from "express";
import AiTrainingModel from "../../../../../models/ai/aiTrainingSchema";
import { loadExtraTrainingSamples, saveExtraTrainingSamples, retrainModel } from "../../../../../handler/facebookBotHandler/ai/intentClassifier";
import { saveCustomFaqEntries } from "../../../../../handler/facebookBotHandler/ai/faqKnowledgeBase";
import * as fs from "fs";
import * as path from "path";

const CUSTOM_FAQ_PATH = path.join(process.cwd(), "ai-model", "custom_faq.json");

function loadCustomFaq(): { questionText: string; answerText: string }[] {
    try {
        if (!fs.existsSync(CUSTOM_FAQ_PATH)) return [];
        return JSON.parse(fs.readFileSync(CUSTOM_FAQ_PATH, "utf-8"));
    } catch { return []; }
}

const addAiTrainingData = async (req: Request, res: Response) => {
    try {
        const { questionText, answerText, intent, sourceMessageId, sourcePlatform } = req.body;
        const addedBy = (req as any).user?.userId || "admin";

        if (!questionText || !answerText || !intent) {
            res.status(400).json({ success: false, message: "questionText, answerText, intent are required" });
            return;
        }

        // 1. Save to MongoDB
        const entry = await AiTrainingModel.create({
            questionText: questionText.trim(),
            answerText:   answerText.trim(),
            intent,
            sourceMessageId: sourceMessageId || null,
            sourcePlatform:  sourcePlatform  || null,
            addedBy,
        });

        // 2. Append to extra_training.json (for NN intent classifier)
        const existing = loadExtraTrainingSamples();
        existing.push({ text: questionText.trim(), intent });
        saveExtraTrainingSamples(existing);

        // 3. Append to custom_faq.json (for FAQ answer retrieval)
        const faqList = loadCustomFaq();
        faqList.push({ questionText: questionText.trim(), answerText: answerText.trim() });
        saveCustomFaqEntries(faqList);

        // 4. Retrain model in background (non-blocking)
        retrainModel().catch(err => console.error("[AI Training] Retrain error:", err));

        res.status(201).json({ success: true, message: "Training data added. Model retraining in background.", data: entry });
    } catch (error) {
        console.error("[addAiTrainingData]", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export default addAiTrainingData;
