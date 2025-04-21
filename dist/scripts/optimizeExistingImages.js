"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const imageOptimizer_1 = require("../utils/imageOptimizer");
// Define optimization options for different image types
const profileImageOptions = {
    maxWidth: 500,
    maxHeight: 500,
    quality: 85,
    format: 'jpeg'
};
const organizationLogoOptions = {
    maxWidth: 800,
    maxHeight: 800,
    quality: 85,
    format: 'webp'
};
// Default options for general images
const defaultOptions = {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 80,
    format: 'webp',
    recursive: true
};
// Path to uploads directory
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
console.log('Starting image optimization for existing uploads...');
console.log(`Uploads directory: ${uploadsDir}`);
// Process all images using default options
(0, imageOptimizer_1.optimizeDirectory)(uploadsDir, defaultOptions)
    .then(count => {
    console.log(`✅ Optimization complete! Processed ${count} images.`);
    console.log('Image sizes have been reduced while maintaining quality.');
    console.log('This will improve page load times and reduce bandwidth usage.');
})
    .catch(error => {
    console.error('❌ Error during optimization:', error);
    process.exit(1);
});
