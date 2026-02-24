import multer from 'multer';
import { NextFunction, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const safeWriteFile = async (filePath: string, data: Buffer, maxRetries = 5, delayMs = 200): Promise<void> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            await fs.promises.writeFile(filePath, data);
            return;
        } catch (error: any) {
            const isLockError = ['EBUSY', 'EPERM', 'EACCES', 'UNKNOWN'].includes(error.code);
            if (isLockError && attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
                continue;
            }
            throw error;
        }
    }
};

const safeDelete = async (filePath: string, maxRetries = 5, delayMs = 200): Promise<boolean> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            await fs.promises.unlink(filePath);
            return true;
        } catch (error: any) {
            if (attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
                continue;
            }
            return false;
        }
    }
    return false;
};

const optimizeBlogImage = async (filePath: string): Promise<string> => {
    try {
        const inputBuffer = await fs.promises.readFile(filePath);
        const originalSize = inputBuffer.length;

        let pipeline = sharp(inputBuffer);
        const metadata = await sharp(inputBuffer).metadata();

        if ((metadata.width && metadata.width > 1200) || (metadata.height && metadata.height > 1200)) {
            pipeline = pipeline.resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true });
        }

        const outputBuffer = await pipeline.webp({ quality: 80 }).toBuffer();
        const finalPath = filePath.replace(/\.[^.]+$/, '.webp');

        if (outputBuffer.length < originalSize || path.extname(filePath).toLowerCase() !== '.webp') {
            await safeWriteFile(finalPath, outputBuffer);
            if (finalPath !== filePath) {
                await safeDelete(filePath);
            }
            const savingsPercent = ((1 - outputBuffer.length / originalSize) * 100).toFixed(1);
            console.log(`[BlogImage] Optimized: ${path.basename(filePath)} → ${path.basename(finalPath)} (${savingsPercent}% reduction)`);
            return finalPath;
        }
        return filePath;
    } catch (error: any) {
        console.error(`[BlogImage] Optimization failed: ${error.message}`);
        return filePath;
    }
};

const blogImageUpload = (req: Request, res: Response, next: NextFunction) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadDir),
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            cb(null, 'blog-' + uniqueSuffix + ext);
        }
    });

    const upload = multer({
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
            if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_COUNT') {
                res.status(400).json({ success: false, message: 'সর্বোচ্চ ১০টি ছবি আপলোড করা যাবে' });
                return;
            }
            next(err);
            return;
        }

        const files = req.files as Express.Multer.File[];
        if (files && files.length > 0) {
            const optimizedUrls: string[] = [];
            for (const file of files) {
                try {
                    const optimizedPath = await optimizeBlogImage(file.path);
                    const filename = path.basename(optimizedPath);
                    optimizedUrls.push(`${process.env.BACKEND_URL}/uploads/${filename}`);
                } catch (error: any) {
                    console.error(`[BlogImage] Failed for ${file.originalname}: ${error.message}`);
                    optimizedUrls.push(`${process.env.BACKEND_URL}/uploads/${file.filename}`);
                }
            }
            res.locals.blogImageUrls = optimizedUrls;
        } else {
            res.locals.blogImageUrls = [];
        }
        next();
    });
};

export default blogImageUpload;
