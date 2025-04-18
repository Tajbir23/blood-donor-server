import { Schema } from "mongoose";
import { FingerprintDataType } from "./fingerprintType";

interface UserType {
    _id: string;
    email: string;
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
    fingerPrint: FingerprintDataType;
    createdAt: string;
    updatedAt: string;
}

export default UserType;