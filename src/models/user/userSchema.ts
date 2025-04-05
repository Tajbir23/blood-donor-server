import { model, Schema } from "mongoose";
import UserType from "../../types/userType";

const userSchema = new Schema<UserType>({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    emailVerified: {
        type: Boolean
    },
    fullName: { 
        type: String, 
        required: true 
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'admin', 'superAdmin', 'moderator']
    },
    organizationId: {
        type: [Schema.Types.ObjectId],
        ref: 'Organization',
    },
    password: {
        type: String,
        required: true
    },
    phone: { 
        type: String, 
        required: true ,
        unique: true,
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
        type: Date,
        default: null
    },
    totalDonationCount: { 
        type: Number,
        default: 0
    },
    canDonate: { 
        type: Boolean, 
        default: true 
    },
    nextDonationDate: { 
        type: String,
        default: null
    },
    badges: {
        type: [String],
        default: []
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
    isBanned: {
        type: Boolean,
        default: false
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    location: {
        type: {
            type: String,
            enum: ['Point'], 
            default: 'Point' 
        },
        coordinates: {
            type: [Number], 
            required: true, 
            index: '2dsphere' // ✅ Ensure geospatial index
        }
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

userSchema.index({ location: '2dsphere' });

const userModel = model<UserType>("User", userSchema)
export default userModel
