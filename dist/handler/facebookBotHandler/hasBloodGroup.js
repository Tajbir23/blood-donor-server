"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hasBloodGroup = (bloodGroup) => {
    console.log("bloodGroup", bloodGroup, "hasBloodGroup");
    return bloodGroup === "A+" || bloodGroup === "A-" || bloodGroup === "B+" || bloodGroup === "B-" || bloodGroup === "AB+" || bloodGroup === "AB-" || bloodGroup === "O+" || bloodGroup === "O-";
};
exports.default = hasBloodGroup;
