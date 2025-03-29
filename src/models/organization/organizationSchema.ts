import { model, Schema } from "mongoose";
import organizationType from "../../types/organizationType";


const organizationSchema = new Schema<organizationType>({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    admins: {
        type: [Schema.Types.ObjectId],
        ref: "User",
    },
    superAdmins: {
        type: [Schema.Types.ObjectId],
        ref: "User",
    },
    moderators: {
        type: [Schema.Types.ObjectId],
        ref: "User",
    },
    organizationName: {
        type: String,
        required: true,
        unique: true
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
    },
    website: {
        type: String,
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

const organizationModel = model<organizationType>("Organization", organizationSchema)
export default organizationModel
