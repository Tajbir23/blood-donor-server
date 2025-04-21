"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createImageUpload = exports.bannerImageUpload = exports.profileImageUpload = exports.thumbnailUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
// Default compression quality (1-100, lower means more compression)
const DEFAULT_QUALITY = 80;
// Default maximum dimensions
const DEFAULT_MAX_WIDTH = 1200;
const DEFAULT_MAX_HEIGHT = 1200;
// Function to optimize image using Sharp
const optimizeImage = async (filePath, options = {}) => {
    const { quality = DEFAULT_QUALITY, maxWidth = DEFAULT_MAX_WIDTH, maxHeight = DEFAULT_MAX_HEIGHT, format = 'jpeg' } = options;
    try {
        // Get image metadata to determine dimensions
        const metadata = await (0, sharp_1.default)(filePath).metadata();
        // Determine if resizing is needed
        const needsResize = metadata.width && metadata.width > maxWidth ||
            metadata.height && metadata.height > maxHeight;
        // Set up Sharp pipeline
        let pipeline = (0, sharp_1.default)(filePath);
        // Resize if necessary, maintaining aspect ratio
        if (needsResize) {
            pipeline = pipeline.resize({
                width: maxWidth,
                height: maxHeight,
                fit: 'inside',
                withoutEnlargement: true
            });
        }
        // Apply compression based on format
        let outputBuffer;
        const outputPath = filePath.replace(/\.[^.]+$/, `.${format}`);
        if (format === 'jpeg') {
            outputBuffer = await pipeline.jpeg({ quality }).toBuffer();
        }
        else if (format === 'png') {
            outputBuffer = await pipeline.png({ quality }).toBuffer();
        }
        else if (format === 'webp') {
            outputBuffer = await pipeline.webp({ quality }).toBuffer();
        }
        // Save the optimized image
        await fs_1.default.promises.writeFile(outputPath, outputBuffer);
        // Delete the original file if the format changed
        if (path_1.default.extname(filePath).slice(1).toLowerCase() !== format) {
            await fs_1.default.promises.unlink(filePath);
        }
        // Return the new file path
        return outputPath;
    }
    catch (error) {
        console.error('Error optimizing image:', error);
        return filePath; // Return original path if optimization fails
    }
};
// Create a factory function that returns the middleware with the desired field name
const createImageUpload = (fieldName = 'profileImage', optimizationOptions = {}) => {
    return async (req, res, next) => {
        var _a;
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
                fileSize: 10 * 1024 * 1024 // 10MB limit (increased to allow for large images before optimization)
            }
        });
        // Only run multer if there's actually a file being uploaded
        if ((_a = req.headers['content-type']) === null || _a === void 0 ? void 0 : _a.includes('multipart/form-data')) {
            const uploadImage = upload.single(fieldName);
            uploadImage(req, res, async (err) => {
                if (err) {
                    console.error('Error uploading file:', err);
                    next(err);
                    return;
                }
                // Log successful upload and add file path to request
                if (req.file) {
                    try {
                        // Optimize the uploaded image
                        const originalPath = req.file.path;
                        const optimizedPath = await optimizeImage(originalPath, optimizationOptions);
                        // Update file information
                        req.file.path = optimizedPath;
                        req.file.filename = path_1.default.basename(optimizedPath);
                        // Get file size of optimized image
                        const stats = await fs_1.default.promises.stat(optimizedPath);
                        req.file.size = stats.size;
                        // Store both the file object and specific paths for easy access
                        res.locals.uploadedFile = req.file;
                        res.locals.imagePath = req.file.path;
                        res.locals.imageFilename = req.file.filename;
                        res.locals.imageUrl = `/uploads/${req.file.filename}`;
                        console.log(`Image optimized: ${path_1.default.basename(originalPath)} → ${path_1.default.basename(optimizedPath)} (${Math.round(stats.size / 1024)}KB)`);
                    }
                    catch (error) {
                        console.error('Error during image optimization:', error);
                        // Continue with the original file if optimization fails
                        res.locals.uploadedFile = req.file;
                        res.locals.imagePath = req.file.path;
                        res.locals.imageFilename = req.file.filename;
                        res.locals.imageUrl = `/uploads/${req.file.filename}`;
                    }
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
// Create various presets for different use cases
exports.thumbnailUpload = createImageUpload('thumbnail', {
    maxWidth: 300,
    maxHeight: 300,
    quality: 80,
    format: 'webp'
});
exports.profileImageUpload = createImageUpload('profileImage', {
    maxWidth: 500,
    maxHeight: 500,
    quality: 85,
    format: 'jpeg'
});
exports.bannerImageUpload = createImageUpload('bannerImage', {
    maxWidth: 1600,
    maxHeight: 900,
    quality: 85,
    format: 'jpeg'
});
// Export default middleware with 'profileImage' as the default field name
exports.default = createImageUpload();
