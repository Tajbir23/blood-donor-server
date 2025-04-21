"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bloodRequestSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    patientName: {
        type: String,
        required: true
    },
    patientProblem: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    alternativeContact: {
        type: String,
    },
    relation: {
        type: String,
        required: true
    },
    bloodGroup: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    bloodUnits: {
        type: String,
        required: true
    },
    urgencyLevel: {
        type: String,
        required: true,
        enum: ['normal', 'urgent', 'emergency']
    },
    requiredDate: {
        type: String,
        required: true
    },
    requiredTime: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    contactPerson: {
        type: String,
        required: true
    },
    contactNumber: {
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
    hospitalId: {
        type: String,
        required: true
    },
    hospitalName: {
        type: String,
        required: true
    },
    hospitalWard: {
        type: String,
        required: true
    },
    patientAge: {
        type: String,
        required: true
    },
    patientGender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other']
    },
    additionalInfo: {
        type: String,
    }
}, {
    timestamps: true
});
bloodRequestSchema.index({ createdAt: -1 }, { expireAfterSeconds: 60 * 60 * 24 * 3 });
const bloodRequestModel = (0, mongoose_1.model)("bloodRequest", bloodRequestSchema);
exports.default = bloodRequestModel;
