import { Schema } from "mongoose";
import { FingerprintDataType } from "./fingerprintType";

interface UserType {
    _id: string;
    email: string;
    isFbConnected: boolean;
    fbId: string;
    emailVerified: boolean;
    fullName: string;
    role: string;
    phone: string;
    password: string;
    organizationId?: Schema.Types.ObjectId[];
    birthDate: string;
    bloodGroup: string;
    gender: string;
    lastDonationDate: Date;
    totalDonationCount: number;
    canDonate: boolean;
    nextDonationDate: string;
    isBanned: boolean;
    ipAddress: string | null;
    badges: string[];
    districtId: string;
    thanaId: string;
    address: string;
    profileImage: Buffer;
    profileImageUrl: string;
    agreedToTerms: boolean;
    isActive: boolean;
    isVerified: boolean;
    reportCount: number;
    latitude: number;
    longitude: number;
    location: {
        type: {
            type: string;
            enum: ['Point'];
        };
        coordinates: number[];
    };
    token: string;
    lastLoginIp: string;
    fingerPrint: FingerprintDataType;
    notificationPreferences: {
        bloodRequestNotification: boolean;
        emailNotification: boolean;
    };
    createdAt: string;
    updatedAt: string;
}

export default UserType;