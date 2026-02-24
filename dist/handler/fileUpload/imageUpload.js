"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createImageUpload = exports.organizationLogoUpload = exports.bannerImageUpload = exports.profileImageUpload = exports.thumbnailUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
// Default compression quality (1-100, lower means more compression)
const DEFAULT_QUALITY = 80;
// Default maximum dimensions
const DEFAULT_MAX_WIDTH = 1200;
const DEFAULT_MAX_HEIGHT = 1200;
// Helper function to safely delete a file with retries for Windows file locking
const safeDelete = async (filePath, maxRetries = 5, delayMs = 200) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            await fs_1.default.promises.unlink(filePath);
            return true;
        }
        catch (error) {
            if (attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
                continue;
            }
            console.warn(`[ImageUpload] Failed to delete ${path_1.default.basename(filePath)} after ${maxRetries} attempts: ${error.code || error.message}`);
            return false;
        }
    }
    return false;
};
// Helper function to safely write buffer to file with retries (handles Windows file locking)
const safeWriteFile = async (filePath, data, maxRetries = 5, delayMs = 200) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            await fs_1.default.promises.writeFile(filePath, data);
            return;
        }
        catch (error) {
            const isLockError = ['EBUSY', 'EPERM', 'EACCES', 'UNKNOWN'].includes(error.code);
            if (isLockError && attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
                continue;
            }
            throw new Error(`Failed to write optimized image to ${path_1.default.basename(filePath)}: ${error.code || 'UNKNOWN'} - ${error.message}`);
        }
    }
};
// Function to optimize image using Sharp (buffer-based to avoid Windows file locking)
const optimizeImage = async (filePath, options = {}) => {
    const { quality = DEFAULT_QUALITY, maxWidth = DEFAULT_MAX_WIDTH, maxHeight = DEFAULT_MAX_HEIGHT, format = 'jpeg' } = options;
    const originalName = path_1.default.basename(filePath);
    try {
        // Read file into buffer FIRST to avoid Sharp holding a file lock on Windows
        const inputBuffer = await fs_1.default.promises.readFile(filePath);
        const originalSize = inputBuffer.length;
        // Get image metadata from buffer
        const metadata = await (0, sharp_1.default)(inputBuffer).metadata();
        // Determine if resizing is needed
        const needsResize = (metadata.width && metadata.width > maxWidth) ||
            (metadata.height && metadata.height > maxHeight);
        // Build Sharp pipeline from buffer (no file handle held)
        let pipeline = (0, sharp_1.default)(inputBuffer);
        if (needsResize) {
            pipeline = pipeline.resize({
                width: maxWidth,
                height: maxHeight,
                fit: 'inside',
                withoutEnlargement: true
            });
        }
        // Apply format-specific compression and get output buffer
        let outputBuffer;
        if (format === 'jpeg') {
            outputBuffer = await pipeline.jpeg({ quality }).toBuffer();
        }
        else if (format === 'png') {
            outputBuffer = await pipeline.png({ quality }).toBuffer();
        }
        else if (format === 'webp') {
            outputBuffer = await pipeline.webp({ quality }).toBuffer();
        }
        else {
            outputBuffer = await pipeline.toBuffer();
        }
        // Determine final output path
        const shouldChangeFormat = path_1.default.extname(filePath).slice(1).toLowerCase() !== format;
        const finalOutputPath = shouldChangeFormat
            ? filePath.replace(/\.[^.]+$/, `.${format}`)
            : filePath;
        // Only replace if we're saving space or changing format
        if (outputBuffer.length < originalSize || shouldChangeFormat) {
            // Write optimized buffer directly to the final path (with retry for file locks)
            await safeWriteFile(finalOutputPath, outputBuffer);
            // If format changed, delete the original file (different path)
            if (shouldChangeFormat && finalOutputPath !== filePath) {
                const deleted = await safeDelete(filePath);
                if (!deleted) {
                    console.warn(`[ImageUpload] Original file ${originalName} could not be deleted, may need manual cleanup`);
                }
            }
            const savingsPercent = ((1 - outputBuffer.length / originalSize) * 100).toFixed(1);
            console.log(`[ImageUpload] Optimized: ${originalName} → ${path_1.default.basename(finalOutputPath)} | ` +
                `${Math.round(originalSize / 1024)}KB → ${Math.round(outputBuffer.length / 1024)}KB (${savingsPercent}% reduction)`);
            return finalOutputPath;
        }
        else {
            // Optimized version is larger — keep original
            console.log(`[ImageUpload] Skipped optimization for ${originalName} (optimized size is larger)`);
            return filePath;
        }
    }
    catch (error) {
        const errorCode = error.code || 'UNKNOWN';
        const errorMsg = error.message || 'Unknown error';
        console.error(`[ImageUpload] Failed to optimize ${originalName}: [${errorCode}] ${errorMsg}`);
        return filePath; // Return original path so upload still works
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
                        // Store file info for downstream handlers
                        res.locals.uploadedFile = req.file;
                        res.locals.imagePath = req.file.path;
                        res.locals.imageFilename = req.file.filename;
                        res.locals.imageUrl = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;
                    }
                    catch (error) {
                        console.error(`[ImageUpload] Optimization failed for ${req.file.originalname}: ${error.message}`);
                        // Continue with the original file if optimization fails
                        res.locals.uploadedFile = req.file;
                        res.locals.imagePath = req.file.path;
                        res.locals.imageFilename = req.file.filename;
                        res.locals.imageUrl = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;
                    }
                }
                else {
                    console.log('[ImageUpload] No file uploaded or file rejected by filter');
                }
                next();
            });
        }
        else {
            // No file in the request, continue to next middleware
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
    format: 'webp'
});
exports.bannerImageUpload = createImageUpload('bannerImage', {
    maxWidth: 1600,
    maxHeight: 900,
    quality: 85,
    format: 'jpeg'
});
// Create optimized organization logo upload with appropriate settings
exports.organizationLogoUpload = createImageUpload('organization', {
    maxWidth: 800,
    maxHeight: 800,
    quality: 85,
    format: 'webp' // Using WebP for better compression while maintaining quality
});
// Export default middleware with 'profileImage' as the default field name
exports.default = createImageUpload();
