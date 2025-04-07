"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createImageUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Create a factory function that returns the middleware with the desired field name
const createImageUpload = (fieldName = 'profileImage') => {
    return (req, res, next) => {
        // Create uploads directory if it doesn't exist
        const uploadDir = path_1.default.join(process.cwd(), 'uploads');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        const storage = multer_1.default.diskStorage({
            destination: function (req, file, cb) {
                cb(null, uploadDir);
            },
            filename: function (req, file, cb) {
                // Keep original extension and generate unique name
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const ext = path_1.default.extname(file.originalname);
                cb(null, file.fieldname + '-' + uniqueSuffix + ext);
            }
        });
        const upload = (0, multer_1.default)({
            storage,
            fileFilter: (req, file, cb) => {
                // Only allow images
                if (!file.mimetype.startsWith('image/')) {
                    return cb(null, false);
                }
                cb(null, true);
            },
            limits: {
                fileSize: 5 * 1024 * 1024 // 5MB limit
            }
        });
        // Only run multer if there's actually a file being uploaded
        if (req.headers['content-type']?.includes('multipart/form-data')) {
            const uploadImage = upload.single(fieldName);
            uploadImage(req, res, (err) => {
                if (err) {
                    console.error('Error uploading file:', err);
                    next(err);
                    return;
                }
                // Log successful upload and add file path to request
                if (req.file) {
                    // Store both the file object and specific paths for easy access
                    res.locals.uploadedFile = req.file;
                    res.locals.imagePath = req.file.path;
                    res.locals.imageFilename = req.file.filename;
                    res.locals.imageUrl = `/uploads/${req.file.filename}`;
                }
                else {
                    console.log('No file uploaded or file rejected');
                }
                next();
            });
        }
        else {
            // No file in the request, continue to next middleware
            console.log('No multipart form data detected, skipping file upload');
            next();
        }
    };
};
exports.createImageUpload = createImageUpload;
// Export default middleware with 'profileImage' as the default field name
exports.default = createImageUpload();
