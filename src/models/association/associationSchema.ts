import { model, Schema } from "mongoose";
import AssociationType from "../../types/asssociationType";

const associationSchema = new Schema<AssociationType>({
    organizationName: {
        type: String,
        required: true
    },
    organizationType: {
        type: String,
        required: true
    },
    establishmentYear: {
        type: String,
        required: true
    },
    registrationNumber: {
        type: String,
        required: true
    },
    website: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },  
    phone: {
        type: String,
        required: true
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
    representativeName: {
        type: String,
        required: true
    },
    representativePosition: {
        type: String,
        required: true
    },
    representativePhone: {
        type: String,
        required: true
    },
    representativeEmail: {
        type: String,
        required: true
    },
    hasBloodBank: {
        type: Boolean,
        required: true
    },
    providesEmergencyBlood: {
        type: Boolean,
        required: true
    },
    availableBloodGroups: {
        type: [String],
        required: true
    },
    logoImage: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword: {
        type: String,
        required: true
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    banReason: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: false
    }

}, { timestamps: true})

const associationModel = model<AssociationType>("Association", associationSchema)
export default associationModel
