"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const verifyIsSuperAdmin = (req, res, next) => {
    const { role } = req.user;
    if (role !== "superAdmin") {
        res.status(403).json({
            success: false,
            message: "এই resource শুধুমাত্র superAdmin এর জন্য",
        });
        return;
    }
    next();
};
exports.default = verifyIsSuperAdmin;
