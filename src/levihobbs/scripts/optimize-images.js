const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../wwwroot/images');
const outputDir = path.join(inputDir, 'optimized');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Get all image files
const files = fs.readdirSync(inputDir)
    .filter(file => /\.(jpg|jpeg|png)$/i.test(file));

// Process each image
async function processImages() {
    for (const file of files) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
        
        try {
            await sharp(inputPath)
                .webp({ quality: 80 })
                .toFile(outputPath);
            console.log(`Optimized ${file} -> ${path.basename(outputPath)}`);
        } catch (error) {
            console.error(`Error processing ${file}:`, error);
        }
    }
}

processImages().catch(console.error); 