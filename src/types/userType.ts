import { Schema } from "mongoose";
import { FingerprintDataType } from "./fingerprintType";

interface UserType {
    _id: string;
    email: string;
    fullName: string;
    role: string;
    phone: string;
    password: string;
    associationId: Schema.Types.ObjectId;
    birthDate: string;
    bloodGroup: string;
    gender: string;
    lastDonationDate: string;
    canDonate: boolean;
    nextDonationDate: string;
    districtId: string;
    thanaId: string;
    address: string;
    profileImage: Buffer;
    profileImageUrl: string;
    agreedToTerms: boolean;
    isActive: boolean;
    isVerified: boolean;
    reportCount: number;
    fingerPrint: FingerprintDataType;
    createdAt: string;
    updatedAt: string;
}

export default UserType;