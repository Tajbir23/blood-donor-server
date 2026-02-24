import { Request, Response } from "express";
import reportModel from "../../../../models/user/reportSchema";

const updateReportStatus = async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const { status, adminNote } = req.body;

        if (!status || !['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
            res.status(400).json({
                success: false,
                message: "সঠিক স্ট্যাটাস প্রদান করুন"
            });
            return;
        }

        const report = await reportModel.findByIdAndUpdate(
            reportId,
            {
                status,
                ...(adminNote !== undefined && { adminNote })
            },
            { new: true }
        ).populate('reportedUserId', 'fullName email phone bloodGroup profileImageUrl')
         .populate('reporterUserId', 'fullName email profileImageUrl');

        if (!report) {
            res.status(404).json({
                success: false,
                message: "রিপোর্ট খুঁজে পাওয়া যায়নি"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "রিপোর্টের স্ট্যাটাস আপডেট করা হয়েছে",
            report
        });
    } catch (error) {
        console.error("Update report status error:", error);
        res.status(500).json({
            success: false,
            message: "সার্ভার ত্রুটি হয়েছে"
        });
    }
};

export default updateReportStatus;
