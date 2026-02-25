import { Request, Response } from "express";
import AiTrainingModel from "../../../../../models/ai/aiTrainingSchema";
import { saveExtraTrainingSamples, retrainModel } from "../../../../../handler/facebookBotHandler/ai/intentClassifier";
import { saveCustomFaqEntries } from "../../../../../handler/facebookBotHandler/ai/faqKnowledgeBase";

const deleteAiTrainingData = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ success: false, message: "Training entry ID is required" });
            return;
        }

        const deleted = await AiTrainingModel.findByIdAndDelete(id);
        if (!deleted) {
            res.status(404).json({ success: false, message: "Training entry not found" });
            return;
        }

        // Rebuild extra_training.json from remaining DB entries
        const remaining = await AiTrainingModel.find({}).lean();
        saveExtraTrainingSamples(remaining.map(e => ({ text: e.questionText, intent: e.intent })));

        // Rebuild custom_faq.json from remaining DB entries
        saveCustomFaqEntries(remaining.map(e => ({ questionText: e.questionText, answerText: e.answerText })));

        // Retrain model in background
        retrainModel().catch(err => console.error("[AI Training] Retrain error:", err));

        res.status(200).json({ success: true, message: "Training entry deleted. Model retraining in background." });
    } catch (error) {
        console.error("[deleteAiTrainingData]", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export default deleteAiTrainingData;
