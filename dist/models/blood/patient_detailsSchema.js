"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const patientDetailsSchema = new mongoose_1.Schema({
    name: {
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
    bloodGroup: {
        type: String,
        required: true
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
}, { timestamps: true });
patientDetailsSchema.index({ location: '2dsphere' });
const patientDetailsModel = (0, mongoose_1.model)('PatientDetails', patientDetailsSchema);
exports.default = patientDetailsModel;
