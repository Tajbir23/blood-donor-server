import { model, Schema } from "mongoose";
import FbUserType from "../../types/fbUserType";

const fbUserSchema = new Schema<FbUserType>({
    psId: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        default: ""
    },
    bloodGroup: {
        type: String,
        required: true
    },
    divisionId: {
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
    lastDonationDate: {
        type: Date,
        default: null
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
}, { timestamps: true });

// Create 2dsphere index for geospatial queries
fbUserSchema.index({ location: "2dsphere" });

const FbUserModel = model<FbUserType>('FbUser', fbUserSchema);

export default FbUserModel;
