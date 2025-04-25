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

// Function to generate a unique temporary file path
const getTempFilePath = (originalPath: string, format: string): string => {
    const dir = path.dirname(originalPath);
    const filename = path.basename(originalPath, path.extname(originalPath));
    const tempName = `${filename}_temp_${Date.now()}_${Math.floor(Math.random() * 10000)}.${format}`;
    return path.join(dir, tempName);
};

// Function to safely rename files (with fallback to copy if rename fails)
const safeRename = async (tempPath: string, targetPath: string): Promise<void> => {
    try {
        // Try rename first (fastest)
        await fs.promises.rename(tempPath, targetPath);
    } catch (error) {
        // If rename fails (often due to cross-device links or permissions)
        try {
            // Try copy + delete approach
            await fs.promises.copyFile(tempPath, targetPath);
            // Try to delete temp file but don't fail if it doesn't work
            try {
                await fs.promises.unlink(tempPath);
            } catch (unlinkError) {
                console.warn(`Could not delete temporary file ${tempPath}: ${unlinkError.message}`);
                // Continue execution even if we couldn't delete the temp file
            }
        } catch (copyError) {
            throw copyError;
        }
    }
};

// Helper function to safely delete a file with retries for Windows
const safeDelete = async (filePath: string, maxRetries = 3, delayMs = 100): Promise<boolean> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            await fs.promises.unlink(filePath);
            return true; // Successfully deleted
        } catch (error) {
            if (attempt < maxRetries - 1) {
                // Wait before retrying to give time for file handles to be released
                await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
                continue;
            }
            console.warn(`Could not delete file ${filePath} after ${maxRetries} attempts: ${error.message}`);
            return false; // Failed to delete after all retries
        }
    }
    return false;
};

// Function to optimize image using Sharp
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

    try {
        // Get image metadata to determine dimensions
        const metadata = await sharp(filePath).metadata();
        
        // Determine if resizing is needed
        const needsResize = metadata.width && metadata.width > maxWidth || 
                           metadata.height && metadata.height > maxHeight;
        
        // Create a temp output path to avoid file locks
        const tempOutputPath = getTempFilePath(filePath, format);
        
        // If we're changing format, we'll need a final path with new extension
        const shouldChangeFormat = path.extname(filePath).slice(1).toLowerCase() !== format;
        const finalOutputPath = shouldChangeFormat ? 
            filePath.replace(/\.[^.]+$/, `.${format}`) : 
            filePath;
        
        // Set up Sharp pipeline
        let pipeline = sharp(filePath);
        
        // Resize if necessary, maintaining aspect ratio
        if (needsResize) {
            pipeline = pipeline.resize({
                width: maxWidth,
                height: maxHeight,
                fit: 'inside',
                withoutEnlargement: true
            });
        }
        
        // Apply appropriate compression based on format
        if (format === 'jpeg') {
            await pipeline.jpeg({ quality }).toFile(tempOutputPath);
        } else if (format === 'png') {
            await pipeline.png({ quality }).toFile(tempOutputPath);
        } else if (format === 'webp') {
            await pipeline.webp({ quality }).toFile(tempOutputPath);
        }
        
        // Get size info for optimization stats
        const originalStats = await fs.promises.stat(filePath);
        const optimizedStats = await fs.promises.stat(tempOutputPath);
        
        // Only replace if we're saving space or changing format
        if (optimizedStats.size < originalStats.size || shouldChangeFormat) {
            try {
                if (shouldChangeFormat) {
                    // If we're changing format, we'll use the new path directly
                    await safeRename(tempOutputPath, finalOutputPath);
                    
                    // Now try to delete the original with our robust method
                    // Only try to delete if the paths are different
                    if (finalOutputPath !== filePath) {
                        // Give the system a moment to release any file handles
                        // This is especially important on Windows
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                        // Try to delete the original with retries
                        const deleted = await safeDelete(filePath);
                        if (!deleted) {
                            console.warn(`Could not delete original file ${filePath} - it may need manual cleanup later`);
                            
                            // Schedule a cleanup attempt for later
                            setTimeout(async () => {
                                try {
                                    if (fs.existsSync(filePath)) {
                                        await fs.promises.unlink(filePath);
                                        console.log(`Delayed cleanup successful for ${filePath}`);
                                    }
                                } catch (e) {
                                    console.warn(`Delayed cleanup failed for ${filePath}: ${e.message}`);
                                }
                            }, 5000); // Try again after 5 seconds
                        }
                    }
                } else {
                    // If keeping the same format, replace the original
                    await safeRename(tempOutputPath, filePath);
                }
            } catch (renameError) {
                console.error(`Error replacing file: ${renameError.message}`);
                // If we can't replace, just use the temp file
                return tempOutputPath;
            }
        } else {
            // If we're not saving space, delete the temp file and keep original
            try {
                await fs.promises.unlink(tempOutputPath);
            } catch (unlinkError) {
                console.warn(`Could not delete temporary file: ${unlinkError.message}`);
            }
            return filePath;
        }
        
        console.log(`Image optimized: ${path.basename(filePath)} → ${path.basename(finalOutputPath)} (${Math.round(optimizedStats.size / 1024)}KB)`);
        
        // Return the path to the optimized image
        return finalOutputPath;
    } catch (error) {
        console.error('Error optimizing image:', error);
        return filePath; // Return original path if optimization fails
    }
};

// Create a factory function that returns the middleware with the desired field name
const createImageUpload = (fieldName = 'profileImage', optimizationOptions = {}) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        console.log('Creating image upload middleware for field:', fieldName, optimizationOptions);
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
                console.log('File name:', file.originalname);
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
                        
                        // Store both the file object and specific paths for easy access
                        res.locals.uploadedFile = req.file;
                        res.locals.imagePath = req.file.path;
                        res.locals.imageFilename = req.file.filename;
                        res.locals.imageUrl = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;
                        
                        console.log(`Image optimized: ${path.basename(originalPath)} → ${path.basename(optimizedPath)} (${Math.round(stats.size / 1024)}KB)`);
                    } catch (error) {
                        console.error('Error during image optimization:', error);
                        // Continue with the original file if optimization fails
                        res.locals.uploadedFile = req.file;
                        res.locals.imagePath = req.file.path;
                        res.locals.imageFilename = req.file.filename;
                        res.locals.imageUrl = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;
                    }
                } else {
                    console.log('No file uploaded or file rejected');
                }
                next();
            });
        } else {
            // No file in the request, continue to next middleware
            console.log('No multipart form data detected, skipping file upload');
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

// Export default middleware with 'profileImage' as the default field name
export default createImageUpload();

// Also export the factory function to create custom field uploads
export { createImageUpload };
