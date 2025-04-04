"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
// Serve invoice PDFs
router.get('/:filename', (function (req, res) {
    try {
        const { filename } = req.params;
        const invoicePath = path_1.default.join(process.cwd(), 'public/invoices', filename);
        // Check if file exists
        if (!fs_1.default.existsSync(invoicePath)) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }
        // Serve the PDF file
        res.contentType('application/pdf');
        fs_1.default.createReadStream(invoicePath).pipe(res);
    }
    catch (error) {
        console.error('Error serving invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to serve invoice'
        });
    }
}));
exports.default = router;
