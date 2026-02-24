"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
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
            throw error;
        }
    }
};
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
            return false;
        }
    }
    return false;
};
const optimizeBlogImage = async (filePath) => {
    try {
        const inputBuffer = await fs_1.default.promises.readFile(filePath);
        const originalSize = inputBuffer.length;
        let pipeline = (0, sharp_1.default)(inputBuffer);
        const metadata = await (0, sharp_1.default)(inputBuffer).metadata();
        if ((metadata.width && metadata.width > 1200) || (metadata.height && metadata.height > 1200)) {
            pipeline = pipeline.resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true });
        }
        const outputBuffer = await pipeline.webp({ quality: 80 }).toBuffer();
        const finalPath = filePath.replace(/\.[^.]+$/, '.webp');
        if (outputBuffer.length < originalSize || path_1.default.extname(filePath).toLowerCase() !== '.webp') {
            await safeWriteFile(finalPath, outputBuffer);
            if (finalPath !== filePath) {
                await safeDelete(filePath);
            }
            const savingsPercent = ((1 - outputBuffer.length / originalSize) * 100).toFixed(1);
            console.log(`[BlogImage] Optimized: ${path_1.default.basename(filePath)} → ${path_1.default.basename(finalPath)} (${savingsPercent}% reduction)`);
            return finalPath;
        }
        return filePath;
    }
    catch (error) {
        console.error(`[BlogImage] Optimization failed: ${error.message}`);
        return filePath;
    }
};
const blogImageUpload = (req, res, next) => {
    const uploadDir = path_1.default.join(process.cwd(), 'uploads');
    if (!fs_1.default.existsSync(uploadDir)) {
        fs_1.default.mkdirSync(uploadDir, { recursive: true });
    }
    const storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => cb(null, uploadDir),
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path_1.default.extname(file.originalname);
            cb(null, 'blog-' + uniqueSuffix + ext);
        }
    });
    const upload = (0, multer_1.default)({
        storage,
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
                return cb(null, false);
            }
            cb(null, true);
        },
        limits: { fileSize: 10 * 1024 * 1024 }
    });
    const uploadMultiple = upload.array('blogImages', 10); // max 10 images
    uploadMultiple(req, res, async (err) => {
        if (err) {
            if (err instanceof multer_1.default.MulterError && err.code === 'LIMIT_FILE_COUNT') {
                res.status(400).json({ success: false, message: 'সর্বোচ্চ ১০টি ছবি আপলোড করা যাবে' });
                return;
            }
            next(err);
            return;
        }
        const files = req.files;
        if (files && files.length > 0) {
            const optimizedUrls = [];
            for (const file of files) {
                try {
                    const optimizedPath = await optimizeBlogImage(file.path);
                    const filename = path_1.default.basename(optimizedPath);
                    optimizedUrls.push(`${process.env.BACKEND_URL}/uploads/${filename}`);
                }
                catch (error) {
                    console.error(`[BlogImage] Failed for ${file.originalname}: ${error.message}`);
                    optimizedUrls.push(`${process.env.BACKEND_URL}/uploads/${file.filename}`);
                }
            }
            res.locals.blogImageUrls = optimizedUrls;
        }
        else {
            res.locals.blogImageUrls = [];
        }
        next();
    });
};
exports.default = blogImageUpload;
