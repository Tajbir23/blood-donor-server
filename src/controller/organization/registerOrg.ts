import { Request, Response } from "express";
import organizationModel from "../../models/organization/organizationSchema";
import organizationType from "../../types/organizationType";

const registerOrg = async (req: Request, res: Response) => {
    try {
        const organizationData: organizationType = JSON.parse(req.body.organizationData);
        const user = (req as any).user;
        const imageUrl = res.locals.imageUrl;

        if (!imageUrl) {
            res.status(400).json({
                success: false,
                message: "প্রতিষ্ঠানের লোগো আপলোড করুন"
            });
            return;
        }

        const organization = await organizationModel.create({
            ...organizationData,
            owner: user._id,
            logoImage: imageUrl
        });

        res.status(201).json({
            success: true,
            message: "প্রতিষ্ঠান সফলভাবে তৈরি হয়েছে",
            organization
        });
    } catch (error: any) {
        // Mongoose validation error — return 400 with field-specific messages
        if (error.name === 'ValidationError') {
            const fieldErrors: Record<string, string> = {};
            const fieldLabels: Record<string, string> = {
                organizationName: 'প্রতিষ্ঠানের নাম',
                organizationType: 'প্রতিষ্ঠানের ধরণ',
                establishmentYear: 'প্রতিষ্ঠার বছর',
                description: 'প্রতিষ্ঠানের বিবরণ',
                email: 'ইমেইল',
                phone: 'ফোন নম্বর',
                districtId: 'জেলা',
                thanaId: 'থানা/উপজেলা',
                address: 'ঠিকানা',
                representativeName: 'প্রতিনিধির নাম',
                representativePosition: 'প্রতিনিধির পদবী',
                representativePhone: 'প্রতিনিধির ফোন',
                representativeEmail: 'প্রতিনিধির ইমেইল',
                hasBloodBank: 'ব্লাড ব্যাংক',
                providesEmergencyBlood: 'জরুরি রক্ত সরবরাহ',
                availableBloodGroups: 'রক্তের গ্রুপ',
                logoImage: 'লোগো'
            };

            for (const field of Object.keys(error.errors)) {
                const label = fieldLabels[field] || field;
                fieldErrors[field] = `${label} প্রদান করা আবশ্যক`;
            }

            const missingFields = Object.values(fieldErrors).join(', ');
            console.warn(`[RegisterOrg] Validation failed: ${Object.keys(error.errors).join(', ')}`);

            res.status(400).json({
                success: false,
                message: `অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন: ${missingFields}`,
                errors: fieldErrors
            });
            return;
        }

        // Duplicate key error
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern || {}).join(', ');
            console.warn(`[RegisterOrg] Duplicate key: ${duplicateField}`);
            res.status(409).json({
                success: false,
                message: `এই ${duplicateField === 'organizationName' ? 'নামে' : duplicateField} ইতিমধ্যে একটি প্রতিষ্ঠান নিবন্ধিত আছে`
            });
            return;
        }

        // JSON parse error
        if (error instanceof SyntaxError) {
            console.error(`[RegisterOrg] Invalid JSON in organizationData`);
            res.status(400).json({
                success: false,
                message: "অবৈধ ডেটা ফরম্যাট"
            });
            return;
        }

        // Unknown server error
        console.error(`[RegisterOrg] Failed: ${error.message || error}`);
        res.status(500).json({
            success: false,
            message: "প্রতিষ্ঠান তৈরি করতে ব্যর্থ হয়েছে, আবার চেষ্টা করুন",
            error: error.message || "Internal server error"
        });
    }
}

export default registerOrg;


