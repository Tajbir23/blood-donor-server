import { model, Schema } from "mongoose";
import UserType from "../../types/userType";

const userSchema = new Schema<UserType>({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    fullName: { 
        type: String, 
        required: true 
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'admin', 'superAdmin', 'moderator', 'associationSuperAdmin', 'associationModerator', 'associationAdmin']
    },
    associationId: {
        type: Schema.Types.ObjectId,
        ref: 'Association',
    },
    password: {
        type: String,
        required: true
    },
    phone: { 
        type: String, 
        required: true ,
        unique: true,
        validate: {
            validator: function(v: string) {
                return /^\+8801\d{9}$/.test(v);
            },
            message: 'Invalid Bangladeshi phone number'
        }
    },
    birthDate: { 
        type: String, 
        required: true 
    },
    bloodGroup: { 
        type: String, 
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    gender: { 
        type: String, 
        required: true,
        enum: ['male', 'female', 'other']
    },
    lastDonationDate: { 
        type: String,
        default: null
    },
    canDonate: { 
        type: Boolean, 
        default: true 
    },
    nextDonationDate: { 
        type: String,
        default: null
    },
    districtId: { 
        type: String, 
        required: true 
    },
    thanaId: { 
        type: String, 
        required: true 
    },
    address: { 
        type: String, 
        required: true 
    },
    profileImageUrl: { 
        type: String,
        default: null
    },
    agreedToTerms: { 
        type: Boolean, 
        required: true,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    reportCount: {
        type: Number,
        default: 0
    },
    fingerPrint: {
        visitorId: { type: String, },
        userAgent: { type: String, },
        language: { type: String, },
        colorDepth: { type: Number, },
        deviceMemory: { type: Number },
        hardwareConcurrency: { type: Number },
        screenResolution: [{ type: Number, }],
        availableScreenResolution: [{ type: Number, }],
        timezoneOffset: { type: Number, },
        timezone: { type: String, },
        sessionStorage: { type: Boolean, },
        localStorage: { type: Boolean, },
        indexedDb: { type: Boolean, },
        cpuClass: { type: String },
        platform: { type: String },
        plugins: [{ type: String }],
        canvas: { type: String },
        webgl: { type: String },
        webglVendorAndRenderer: { type: String },
        adBlockUsed: { type: Boolean },
        fonts: [{ type: String }],
        audio: { type: String },
        deviceId: { type: String }
    }
}, { 
    timestamps: true 
});

const userModel = model<UserType>("User", userSchema)
export default userModel
