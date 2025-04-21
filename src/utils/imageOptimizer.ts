import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Default optimization options
const DEFAULT_OPTIONS = {
    quality: 80,
    maxWidth: 1200,
    maxHeight: 1200,
    format: 'jpeg' as 'jpeg' | 'png' | 'webp'
};

/**
 * Optimize a single image
 * @param inputPath Path to the input image
 * @param outputPath Optional custom output path
 * @param options Optimization options
 * @returns Path to the optimized image
 */
export const optimizeImage = async (
    inputPath: string, 
    outputPath?: string, 
    options: {
        quality?: number,
        maxWidth?: number,
        maxHeight?: number,
        format?: 'jpeg' | 'png' | 'webp'
    } = {}
): Promise<string> => {
    // Merge with default options
    const {
        quality = DEFAULT_OPTIONS.quality,
        maxWidth = DEFAULT_OPTIONS.maxWidth,
        maxHeight = DEFAULT_OPTIONS.maxHeight,
        format = DEFAULT_OPTIONS.format
    } = options;

    try {
        // Get image metadata to determine dimensions
        const metadata = await sharp(inputPath).metadata();
        
        // Determine if resizing is needed
        const needsResize = metadata.width && metadata.width > maxWidth || 
                           metadata.height && metadata.height > maxHeight;
        
        // Set up Sharp pipeline
        let pipeline = sharp(inputPath);
        
        // Resize if necessary, maintaining aspect ratio
        if (needsResize) {
            pipeline = pipeline.resize({
                width: maxWidth,
                height: maxHeight,
                fit: 'inside',
                withoutEnlargement: true
            });
        }
        
        // If no output path is provided, use the input path with new extension
        const actualOutputPath = outputPath || inputPath.replace(/\.[^.]+$/, `.${format}`);
        
        // Apply compression based on format
        if (format === 'jpeg') {
            await pipeline.jpeg({ quality }).toFile(actualOutputPath);
        } else if (format === 'png') {
            await pipeline.png({ quality }).toFile(actualOutputPath);
        } else if (format === 'webp') {
            await pipeline.webp({ quality }).toFile(actualOutputPath);
        }
        
        // If input and output are different, and no custom output path was provided,
        // delete the original file
        if (inputPath !== actualOutputPath && !outputPath) {
            await fs.promises.unlink(inputPath);
        }
        
        // Get file sizes for reporting
        const inputStats = await fs.promises.stat(inputPath);
        const outputStats = await fs.promises.stat(actualOutputPath);
        const savingsPercent = ((1 - (outputStats.size / inputStats.size)) * 100).toFixed(1);
        
        console.log(
            `Optimized: ${path.basename(inputPath)} → ${path.basename(actualOutputPath)} | ` +
            `${(inputStats.size / 1024).toFixed(0)}KB → ${(outputStats.size / 1024).toFixed(0)}KB ` +
            `(${savingsPercent}% reduction)`
        );
        
        // Return the path to the optimized image
        return actualOutputPath;
    } catch (error) {
        console.error(`Error optimizing ${inputPath}:`, error);
        return inputPath; // Return original path if optimization fails
    }
};

/**
 * Bulk optimize all images in a directory
 * @param directoryPath Path to the directory containing images
 * @param options Optimization options
 * @returns Number of successfully optimized images
 */
export const optimizeDirectory = async (
    directoryPath: string,
    options: {
        quality?: number,
        maxWidth?: number,
        maxHeight?: number,
        format?: 'jpeg' | 'png' | 'webp',
        recursive?: boolean
    } = {}
): Promise<number> => {
    const { recursive = false, ...imageOptions } = options;
    let optimizedCount = 0;
    
    try {
        // Get all files in the directory
        const files = await fs.promises.readdir(directoryPath);
        
        // Process each file
        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const stats = await fs.promises.stat(filePath);
            
            if (stats.isDirectory() && recursive) {
                // Recursively process subdirectories if enabled
                optimizedCount += await optimizeDirectory(filePath, options);
            } else if (stats.isFile() && /\.(jpe?g|png|gif|webp|bmp|tiff?)$/i.test(file)) {
                // Process image files
                await optimizeImage(filePath, undefined, imageOptions);
                optimizedCount++;
            }
        }
        
        return optimizedCount;
    } catch (error) {
        console.error(`Error optimizing directory ${directoryPath}:`, error);
        return optimizedCount;
    }
};

// Command-line interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log(`
Usage: ts-node imageOptimizer.ts <directory> [options]

Options:
  --quality=<number>    JPEG/WebP quality (1-100, default: ${DEFAULT_OPTIONS.quality})
  --max-width=<number>  Maximum width (default: ${DEFAULT_OPTIONS.maxWidth})
  --max-height=<number> Maximum height (default: ${DEFAULT_OPTIONS.maxHeight})
  --format=<format>     Output format (jpeg, png, webp, default: ${DEFAULT_OPTIONS.format})
  --recursive           Process subdirectories

Example:
  ts-node imageOptimizer.ts ./uploads --quality=85 --format=webp --recursive
`);
        process.exit(1);
    }
    
    const directoryPath = args[0];
    
    // Parse command line options
    const options: any = {};
    args.slice(1).forEach(arg => {
        if (arg === '--recursive') {
            options.recursive = true;
        } else if (arg.startsWith('--quality=')) {
            options.quality = parseInt(arg.split('=')[1]);
        } else if (arg.startsWith('--max-width=')) {
            options.maxWidth = parseInt(arg.split('=')[1]);
        } else if (arg.startsWith('--max-height=')) {
            options.maxHeight = parseInt(arg.split('=')[1]);
        } else if (arg.startsWith('--format=')) {
            options.format = arg.split('=')[1];
        }
    });
    
    // Run optimization
    optimizeDirectory(directoryPath, options)
        .then(count => {
            console.log(`Optimized ${count} images in ${directoryPath}`);
        })
        .catch(error => {
            console.error('Error:', error);
            process.exit(1);
        });
}

export default {
    optimizeImage,
    optimizeDirectory
}; 