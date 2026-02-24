import multer from 'multer';
import { NextFunction, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// Default compression quality (1-100, lower means more compression)
const DEFAULT_QUALITY = 80;

// Default maximum dimensions
const DEFAULT_MAX_WIDTH = 1200;
const DEFAULT_MAX_HEIGHT = 1200;

// Helper function to safely delete a file with retries for Windows file locking
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
            console.warn(`[ImageUpload] Failed to delete ${path.basename(filePath)} after ${maxRetries} attempts: ${error.code || error.message}`);
            return false;
        }
    }
    return false;
};

// Helper function to safely write buffer to file with retries (handles Windows file locking)
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
            throw new Error(
                `Failed to write optimized image to ${path.basename(filePath)}: ${error.code || 'UNKNOWN'} - ${error.message}`
            );
        }
    }
};

// Function to optimize image using Sharp (buffer-based to avoid Windows file locking)
const optimizeImage = async (filePath: string, options: {
    quality?: number,
    maxWidth?: number,
    maxHeight?: number,
    format?: 'jpeg' | 'png' | 'webp'
} = {}) => {
    const {
        quality = DEFAULT_QUALITY,
        maxWidth = DEFAULT_MAX_WIDTH,
        maxHeight = DEFAULT_MAX_HEIGHT,
        format = 'jpeg'
    } = options;

    const originalName = path.basename(filePath);

    try {
        // Read file into buffer FIRST to avoid Sharp holding a file lock on Windows
        const inputBuffer = await fs.promises.readFile(filePath);
        const originalSize = inputBuffer.length;

        // Get image metadata from buffer
        const metadata = await sharp(inputBuffer).metadata();

        // Determine if resizing is needed
        const needsResize = (metadata.width && metadata.width > maxWidth) ||
                           (metadata.height && metadata.height > maxHeight);

        // Build Sharp pipeline from buffer (no file handle held)
        let pipeline = sharp(inputBuffer);

        if (needsResize) {
            pipeline = pipeline.resize({
                width: maxWidth,
                height: maxHeight,
                fit: 'inside',
                withoutEnlargement: true
            });
        }

        // Apply format-specific compression and get output buffer
        let outputBuffer: Buffer;
        if (format === 'jpeg') {
            outputBuffer = await pipeline.jpeg({ quality }).toBuffer();
        } else if (format === 'png') {
            outputBuffer = await pipeline.png({ quality }).toBuffer();
        } else if (format === 'webp') {
            outputBuffer = await pipeline.webp({ quality }).toBuffer();
        } else {
            outputBuffer = await pipeline.toBuffer();
        }

        // Determine final output path
        const shouldChangeFormat = path.extname(filePath).slice(1).toLowerCase() !== format;
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
            console.log(
                `[ImageUpload] Optimized: ${originalName} → ${path.basename(finalOutputPath)} | ` +
                `${Math.round(originalSize / 1024)}KB → ${Math.round(outputBuffer.length / 1024)}KB (${savingsPercent}% reduction)`
            );

            return finalOutputPath;
        } else {
            // Optimized version is larger — keep original
            console.log(`[ImageUpload] Skipped optimization for ${originalName} (optimized size is larger)`);
            return filePath;
        }
    } catch (error: any) {
        const errorCode = error.code || 'UNKNOWN';
        const errorMsg = error.message || 'Unknown error';
        console.error(`[ImageUpload] Failed to optimize ${originalName}: [${errorCode}] ${errorMsg}`);
        return filePath; // Return original path so upload still works
    }
};

// Create a factory function that returns the middleware with the desired field name
const createImageUpload = (fieldName = 'profileImage', optimizationOptions = {}) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, uploadDir);
            },
            filename: function (req, file, cb) {
                // Keep original extension and generate unique name
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const ext = path.extname(file.originalname);
                cb(null, file.fieldname + '-' + uniqueSuffix + ext);
            }
        });

        const upload = multer({ 
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
        if (req.headers['content-type']?.includes('multipart/form-data')) {
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
                        req.file.filename = path.basename(optimizedPath);

                        // Get file size of optimized image
                        const stats = await fs.promises.stat(optimizedPath);
                        req.file.size = stats.size;

                        // Store file info for downstream handlers
                        res.locals.uploadedFile = req.file;
                        res.locals.imagePath = req.file.path;
                        res.locals.imageFilename = req.file.filename;
                        res.locals.imageUrl = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;
                    } catch (error: any) {
                        console.error(`[ImageUpload] Optimization failed for ${req.file.originalname}: ${error.message}`);
                        // Continue with the original file if optimization fails
                        res.locals.uploadedFile = req.file;
                        res.locals.imagePath = req.file.path;
                        res.locals.imageFilename = req.file.filename;
                        res.locals.imageUrl = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;
                    }
                } else {
                    console.log('[ImageUpload] No file uploaded or file rejected by filter');
                }
                next();
            });
        } else {
            // No file in the request, continue to next middleware
            next();
        }
    };
};

// Create various presets for different use cases
export const thumbnailUpload = createImageUpload('thumbnail', {
    maxWidth: 300,
    maxHeight: 300,
    quality: 80,
    format: 'webp'
});

export const profileImageUpload = createImageUpload('profileImage', {
    maxWidth: 500,
    maxHeight: 500,
    quality: 85,
    format: 'webp'
});

export const bannerImageUpload = createImageUpload('bannerImage', {
    maxWidth: 1600,
    maxHeight: 900,
    quality: 85,
    format: 'jpeg'
});

// Create optimized organization logo upload with appropriate settings
export const organizationLogoUpload = createImageUpload('organization', {
    maxWidth: 800,
    maxHeight: 800,
    quality: 85,
    format: 'webp' // Using WebP for better compression while maintaining quality
});

// Export default middleware with 'profileImage' as the default field name
export default createImageUpload();

// Also export the factory function to create custom field uploads
export { createImageUpload };
