import { Schema } from "mongoose";

interface organizationType {
    _id: Schema.Types.ObjectId;
    // প্রতিষ্ঠান সম্পর্কিত তথ্য
    owner: Schema.Types.ObjectId;
    admins: Schema.Types.ObjectId[];
    superAdmins: Schema.Types.ObjectId[];
    moderators: Schema.Types.ObjectId[];
    organizationName: string;
    organizationType: string;
    establishmentYear: string;
    registrationNumber: string;
    website: string;
    description: string;

    // যোগাযোগের তথ্য
    email: string;
    phone: string;

    // ঠিকানার তথ্য
    districtId: string;
    thanaId: string;
    address: string;

    // প্রতিনিধির তথ্য
    representativeName: string;
    representativePosition: string;
    representativePhone: string;
    representativeEmail: string;

    // সেবা সম্পর্কিত তথ্য
    hasBloodBank: boolean;
    providesEmergencyBlood: boolean;
    availableBloodGroups: string[];

    // লোগো/ছবি
    logoImage: File | null;
    logoImageUrl: string;


    // শর্তাবলী
    agreedToTerms: boolean;
    isBanned: boolean;
    banReason: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export default organizationType;
