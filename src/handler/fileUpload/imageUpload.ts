import multer from 'multer';
import { NextFunction, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const imageUpload = (req: Request, res: Response, next: NextFunction) => {
    
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
            fileSize: 5 * 1024 * 1024 // 5MB limit
        }
    });

    // Only run multer if there's actually a file being uploaded
    if (req.headers['content-type']?.includes('multipart/form-data')) {
        const uploadImage = upload.single('profileImage');
        uploadImage(req, res, (err) => {
            if (err) {
                console.error('Error uploading file:', err);
                next(err);
                return;
            }

            // Log successful upload and add file path to request
            if (req.file) {
                console.log('File uploaded successfully:', req.file.path);
                
                // Store both the file object and specific paths for easy access
                res.locals.uploadedFile = req.file;
                res.locals.imagePath = req.file.path;
                res.locals.imageFilename = req.file.filename;
                res.locals.imageUrl = `/uploads/${req.file.filename}`;
                
                console.log('Image URL:', res.locals.imageUrl);
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
}

export default imageUpload;
