import { Request, Response } from "express";
import userModel from "../../models/user/userSchema";

interface UserRequest extends Request {
    user: {
        _id: string;
    }
}

const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userRequest = req as UserRequest;
        const { fullName, phone, bloodGroup, address, districtId, thanaId, latitude, longitude } = req.body;

        const updateData: Record<string, unknown> = {};

        if (fullName) updateData.fullName = fullName;
        if (phone) updateData.phone = phone;
        if (bloodGroup) updateData.bloodGroup = bloodGroup;
        if (address) updateData.address = address;
        if (districtId) updateData.districtId = districtId;
        if (thanaId) updateData.thanaId = thanaId;
        if (latitude !== undefined && longitude !== undefined) {
            updateData.latitude = latitude;
            updateData.longitude = longitude;
            updateData.location = {
                type: 'Point',
                coordinates: [longitude, latitude]
            };
        }

        const user = await userModel.findByIdAndUpdate(
            userRequest.user._id,
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (!user) {
            res.status(404).json({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি' });
            return;
        }

        res.status(200).json({ success: true, message: 'প্রোফাইল সফলভাবে আপডেট হয়েছে', user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'সার্ভার ত্রুটি', error });
    }
}

export default updateProfile;
