"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const verifyIsAdmin = async (req, res, next) => {
    const { role } = req.user;
    if (role !== 'admin' && role !== 'superAdmin' && role !== 'moderator') {
        res.status(403).json({
            success: false,
            message: "You are not authorized to access this resource"
        });
        return;
    }
    req.role = role;
    next();
};
exports.default = verifyIsAdmin;
