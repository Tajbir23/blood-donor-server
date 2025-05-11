"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const fbUserSchema = new mongoose_1.Schema({
    psId: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
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
const FbUserModel = (0, mongoose_1.model)('FbUser', fbUserSchema);
exports.default = FbUserModel;
